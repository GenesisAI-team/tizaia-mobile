export type RootDrawerParamList = {
  Home: undefined;
  Attendance: undefined;
  Students: undefined;
  Tasks: undefined;
  Mail: undefined;
  Annotations: undefined;
  Classes: undefined;
  NewAnnotation: { studentId?: string } | undefined;
  NewMail: { studentId?: string; source?: 'mail' | 'annotation' } | undefined;
  StudentProfile: { studentId?: string } | undefined;
};
