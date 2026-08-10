import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';

import type { AssistantGateway } from '../domain/assistantGateway';
import { FakeAssistantGateway } from '../infrastructure/fakeAssistantGateway';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const ASSISTANT_GREETING = 'Buenas 👋 ¿En qué te puedo ayudar?';
const ASSISTANT_ERROR_MESSAGE =
  'No he podido responder. Inténtalo de nuevo en un momento.';

/**
 * Home: shell de chat de "Tu asistente virtual" (HU-003).
 * La lógica real del asistente es HU-002; de momento se cablea al
 * FakeAssistantGateway existente para validar el flujo de envío.
 */
export function HomeScreen(): React.JSX.Element {
  const headerHeight = useHeaderHeight();
  const gatewayRef = useRef<AssistantGateway | null>(null);
  if (gatewayRef.current === null) {
    gatewayRef.current = new FakeAssistantGateway();
  }
  const conversationIdRef = useRef<string | undefined>(undefined);
  const nextIdRef = useRef(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'greeting', role: 'assistant', content: ASSISTANT_GREETING },
  ]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  const createMessage = (
    role: ChatMessage['role'],
    content: string,
  ): ChatMessage => {
    nextIdRef.current += 1;
    return { id: `${role}-${nextIdRef.current}`, role, content };
  };

  const sendDraft = async (): Promise<void> => {
    const text = draft.trim();
    if (text.length === 0 || isSending) return;
    setMessages((current) => [...current, createMessage('user', text)]);
    setDraft('');
    setIsSending(true);
    try {
      const response = await gatewayRef.current!.sendMessage({
        message: text,
        conversationId: conversationIdRef.current,
      });
      conversationIdRef.current =
        response.conversationId ?? conversationIdRef.current;
      setMessages((current) => [
        ...current,
        createMessage('assistant', response.message),
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        createMessage('assistant', ASSISTANT_ERROR_MESSAGE),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
      style={styles.container}
    >
      <Text accessibilityRole="header" style={styles.title}>
        Tu asistente virtual
      </Text>
      <FlatList
        contentContainerStyle={styles.messagesContent}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={styles.bubbleText}>{item.content}</Text>
          </View>
        )}
        style={styles.messages}
      />
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel="Mensaje para el asistente"
          onChangeText={setDraft}
          onSubmitEditing={() => void sendDraft()}
          placeholder="Compañero, escríbeme aquí…"
          returnKeyType="send"
          style={styles.input}
          value={draft}
        />
        <Pressable
          accessibilityLabel="Enviar mensaje"
          accessibilityRole="button"
          disabled={isSending || draft.trim().length === 0}
          onPress={() => void sendDraft()}
          style={({ pressed }) => [
            styles.sendButton,
            (pressed || isSending || draft.trim().length === 0) &&
              styles.sendButtonDisabled,
          ]}
          testID="send-button"
        >
          <Text style={styles.sendButtonLabel}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    gap: 8,
    padding: 16,
  },
  bubble: {
    borderRadius: 12,
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6e6e6',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#cde4ff',
  },
  bubbleText: {
    fontSize: 15,
  },
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  input: {
    borderColor: '#888',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 16,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonLabel: {
    color: '#fff',
    fontSize: 18,
  },
});
