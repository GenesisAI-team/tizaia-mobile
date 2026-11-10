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
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import { useAssistantGateway } from '../../../app/AppDependenciesProvider';
import { ScreenBackground } from '../../../shared/components/ScreenBackground';
import { ScreenTitle } from '../../../shared/components/ScreenTitle';
import { TabBar } from '../../../shared/components/TabBar';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';
import { useTabBarPress } from '../../../navigation/useTabBarPress';
import type { RootDrawerParamList } from '../../../navigation/types';
import { toUserMessage } from '../../../shared/state/schoolDataProvider';
import type { QuickAction } from './homeQuickActions';
import { selectQuickActionSet } from './homeQuickActions';
import { HomeWelcomeCard } from './HomeWelcomeCard';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Home definitivo (DESIGN.md §5.1, frame n865 de Tizaia.op): título HOME,
 * bienvenida con accesos rápidos cuando no hay conversación (MOB-HOME-001),
 * chat real a partir del primer envío, campo de mensaje y TabBar con Home
 * activo. La lógica real del asistente es HU-002; el gateway llega desde la
 * raíz de la aplicación.
 */
export function HomeScreen(): React.JSX.Element {
  const headerHeight = useHeaderHeight();
  const onPressTab = useTabBarPress();
  const assistantGateway = useAssistantGateway();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const conversationIdRef = useRef<string | undefined>(undefined);
  const nextIdRef = useRef(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickActionSet] = useState(() => selectQuickActionSet());
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
      const response = await assistantGateway.sendMessage({
        message: text,
        conversationId: conversationIdRef.current,
      });
      conversationIdRef.current =
        response.conversationId ?? conversationIdRef.current;
      setMessages((current) => [
        ...current,
        createMessage('assistant', response.message),
      ]);
    } catch (error) {
      // Error recuperable y comprensible: red/timeout/404 de conversación…
      setMessages((current) => [
        ...current,
        createMessage('assistant', toUserMessage(error)),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickActionPress = (action: QuickAction): void => {
    navigation.navigate(action.route);
  };

  const showWelcome = messages.length === 0 && draft.trim().length === 0;

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
          ListEmptyComponent={
            showWelcome ? (
              <HomeWelcomeCard
                actionSet={quickActionSet}
                onSelectAction={handleQuickActionPress}
              />
            ) : null
          }
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
        <TabBar
          activeTab="home"
          onPressTab={onPressTab}
          style={styles.tabBar}
        />
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
