package br.com.gesint.modules.root.assistant.activity;

import java.util.function.Consumer;

/**
 * Aviso curto do que o assistente está fazendo agora, para o chat mostrar em tempo real.
 * O listener vive na thread que atende a conversa.
 */
public final class AssistantActivity {

    private static final ThreadLocal<Consumer<String>> LISTENER = new ThreadLocal<>();

    private AssistantActivity() {}

    public static void bind(Consumer<String> listener) {
        if (listener == null) {
            LISTENER.remove();
            return;
        }
        LISTENER.set(listener);
    }

    public static void clear() {
        LISTENER.remove();
    }

    public static void report(String text) {
        if (text == null || text.isBlank()) {
            return;
        }
        Consumer<String> listener = LISTENER.get();
        if (listener != null) {
            listener.accept(text.trim());
        }
    }
}
