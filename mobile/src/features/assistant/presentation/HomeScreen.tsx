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

import { ScreenBackground } from '../../../shared/components/ScreenBackground';
import { ScreenTitle } from '../../../shared/components/ScreenTitle';
import { TabBar } from '../../../shared/components/TabBar';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';
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
 * Home definitivo (DESIGN.md §5.1, frame n865 de Tizaia.op): título HOME,
 * chat con burbuja de saludo, campo de mensaje y TabBar con Home activo.
 * La lógica real del asistente es HU-002; se mantiene el FakeAssistantGateway.
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
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
        style={styles.container}
      >
        <View style={styles.titleBlock}>
          <ScreenTitle>HOME</ScreenTitle>
        </View>
        <FlatList
          contentContainerStyle={styles.messagesContent}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user'
                  ? styles.userBubble
                  : styles.assistantBubble,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  item.role === 'user' && styles.userBubbleText,
                ]}
              >
                {item.content}
              </Text>
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
            placeholderTextColor={tizaiaColors.ink}
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
        <TabBar activeTab="home" style={styles.tabBar} />
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFDFC',
  },
  bubble: {
    borderRadius: dp(44),
    maxWidth: '80%',
    paddingHorizontal: dp(29),
    paddingVertical: dp(32),
  },
  bubbleText: {
    color: tizaiaColors.ink,
    fontSize: dp(32),
  },
  container: {
    flex: 1,
  },
  input: {
    backgroundColor: tizaiaColors.white,
    borderRadius: dp(44),
    color: tizaiaColors.ink,
    flex: 1,
    fontSize: dp(28),
    height: dp(88),
    paddingHorizontal: dp(39),
  },
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(14),
    paddingHorizontal: dp(40),
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    gap: dp(16),
    padding: dp(40),
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.inkButton,
    borderRadius: dp(47),
    height: dp(94),
    justifyContent: 'center',
    width: dp(94),
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonLabel: {
    color: tizaiaColors.white,
    fontSize: dp(38),
    fontWeight: '700',
  },
  tabBar: {
    alignSelf: 'center',
    marginBottom: dp(24),
    marginTop: dp(16),
  },
  titleBlock: {
    marginBottom: dp(24),
    marginTop: dp(24),
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: tizaiaColors.inkButton,
  },
  userBubbleText: {
    color: tizaiaColors.white,
  },
});
