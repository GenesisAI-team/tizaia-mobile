import { ApiSchoolRepository } from './apiSchoolRepository';
import { createApiClient } from './apiClient';

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

const BOOTSTRAP_BODY = {
  teacher: {
    id: 'teacher-1',
    name: 'Laura Martínez',
    email: 'laura@tizaia.es',
  },
  activeClassId: 'class-1',
  classes: [
    { id: 'class-1', groupName: '1.º BACHILLER D', subject: 'Tecnología' },
  ],
};

describe('ApiSchoolRepository (contratos REST de #67)', () => {
  let fetchMock: jest.Mock;
  let repository: ApiSchoolRepository;

  beforeEach(() => {
    fetchMock = jest.fn();
    jest.spyOn(globalThis, 'fetch').mockImplementation(fetchMock);
    repository = new ApiSchoolRepository(
      createApiClient({ baseUrl: 'http://localhost:3000' }),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getBootstrap mapea el contexto mínimo a dominio', async () => {
    fetchMock.mockResolvedValue(jsonResponse(BOOTSTRAP_BODY));

    const bootstrap = await repository.getBootstrap();

    const [url] = fetchMock.mock.calls[0]! as unknown as [string];
    expect(url).toBe('http://localhost:3000/v1/bootstrap');
    expect(bootstrap.activeClassId).toBe('class-1');
    expect(bootstrap.classes[0]).toMatchObject({ id: 'class-1' });
    expect(
      (bootstrap as unknown as { students: unknown }).students,
    ).toBeUndefined();
  });

  it('getStudents pide la clase correspondiente', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse([
        {
          id: 'student-1',
          classId: 'class-1',
          firstName: 'Ada',
          lastName: 'López',
          birthDate: '2009-01-01',
          schoolEmail: 'ada@edu.es',
          description: null,
        },
      ]),
    );

    await repository.getStudents('class-1');

    const [url] = fetchMock.mock.calls[0]! as unknown as [string];
    expect(url).toBe('http://localhost:3000/v1/classes/class-1/students');
  });

  it('setAttendanceStatus hace PUT con el cuerpo {status}', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        id: 'att-1',
        studentId: 'student-1',
        date: '2026-08-21',
        status: 'late',
      }),
    );

    const record = await repository.setAttendanceStatus({
      classId: 'class-1',
      studentId: 'student-1',
      date: '2026-08-21',
      status: 'late',
    });

    const [url, init] = fetchMock.mock.calls[0]! as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe(
      'http://localhost:3000/v1/attendance/class-1/student-1/2026-08-21',
    );
    expect(init.method).toBe('PUT');
    expect(init.body).toBe(JSON.stringify({ status: 'late' }));
    expect(record.status).toBe('late');
  });

  it('deleteStudentCascade lanza DELETE y resuelve sin cuerpo', async () => {
    fetchMock.mockResolvedValue(jsonResponse(undefined, 204));

    await expect(
      repository.deleteStudentCascade('student-1'),
    ).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0]! as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('http://localhost:3000/v1/students/student-1');
    expect(init.method).toBe('DELETE');
  });

  it('sendMail envía subject, body y recipientIds al POST /v1/mails', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          id: 'mail-30',
          folder: 'sent',
          senderStudentId: null,
          senderLabel: 'Laura Martínez',
          subject: 'Salida',
          body: 'Confirmad.',
          preview: 'Confirmad.',
          receivedAt: '2026-08-21T10:00:00.000Z',
          isRead: true,
          recipients: [],
        },
        201,
      ),
    );

    const mail = await repository.sendMail({
      subject: 'Salida',
      body: 'Confirmad.',
      recipientIds: ['family-student-1', 'group-class-1'],
    });

    const [url, init] = fetchMock.mock.calls[0]! as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('http://localhost:3000/v1/mails');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      subject: 'Salida',
      body: 'Confirmad.',
      recipientIds: ['family-student-1', 'group-class-1'],
    });
    expect(mail.folder).toBe('sent');
  });

  it('getMails distingue bandeja enviados vía query', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await repository.getMails('sent');

    const [url] = fetchMock.mock.calls[0]! as unknown as [string];
    expect(url).toContain('/v1/mails?folder=sent');
  });
});
