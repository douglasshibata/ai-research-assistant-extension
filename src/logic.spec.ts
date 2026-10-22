import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the chrome API
const chromeMock = {
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    }
  },
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    }
  },
  sidePanel: {
    setPanelBehavior: vi.fn().mockResolvedValue({}),
  }
};

(global as any).chrome = chromeMock;

describe('Extension Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('content script should respond to GET_SELECTION', async () => {
    // Mock window.getSelection
    (global as any).window = {
      getSelection: () => ({
        toString: () => 'test selection'
      })
    };

    // Simulate the listener
    let listener: any;
    chromeMock.runtime.onMessage.addListener.mockImplementation((l: any) => {
      listener = l;
    });

    // Re-import or evaluate content script
    await import('./content-script.ts');

    const sendResponse = vi.fn();
    listener({ type: 'GET_SELECTION' }, {}, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith({ selection: 'test selection' });
  });

  it('sidepanel should load chat history from storage', async () => {
    const history = [{ role: 'user', content: 'hello', timestamp: 123 }];
    chromeMock.storage.local.get.mockResolvedValue({ chat_history: history });

    // Mock DOM
    document.body.innerHTML = `
      <div id="chat-container"></div>
      <template id="message-template">
        <div class="message"><div class="content"></div><span class="time"></span></div>
      </template>
      <header><button id="clear-btn"></button><button id="settings-btn"></button></header>
      <div id="settings-view" class="hidden">
        <input id="api-key-input">
        <button id="save-key-btn"></button>
      </div>
      <footer>
        <div id="selection-preview" class="hidden"><div class="italic"></div><button id="clear-selection"></button></div>
        <textarea id="user-input"></textarea>
        <button id="send-btn"></button>
      </footer>
    `;

    // Import sidepanel logic
    await import('./sidepanel.ts');

    // Wait for async init
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(chromeMock.storage.local.get).toHaveBeenCalledWith(['chat_history', 'gemini_api_key']);
    const chatContainer = document.getElementById('chat-container');
    expect(chatContainer?.innerHTML).toContain('hello');
  });
});
