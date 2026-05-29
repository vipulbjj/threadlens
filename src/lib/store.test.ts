import { beforeEach, describe, expect, it } from "vitest";
import { useChatStore } from "./store";

describe("chat store", () => {
  beforeEach(() => {
    localStorage.clear();
    useChatStore.setState({ sessions: [], activeSessionId: null });
    useChatStore.persist.clearStorage();
  });

  it("setChat creates a session and sets it active", () => {
    const id = useChatStore.getState().setChat(
      "Weekend crew",
      [{ date: "1/1/24", time: "10:00", sender: "Sam", message: "hey" }],
      "whatsapp",
      "couples"
    );
    const state = useChatStore.getState();
    expect(state.sessions).toHaveLength(1);
    expect(state.sessions[0].name).toBe("Weekend crew");
    expect(state.sessions[0].useCase).toBe("couples");
    expect(state.activeSessionId).toBe(id);
  });

  it("removeSession drops session and clears active when needed", () => {
    const id = useChatStore.getState().setChat("Gone", [], "telegram");
    useChatStore.getState().removeSession(id);
    const state = useChatStore.getState();
    expect(state.sessions).toHaveLength(0);
    expect(state.activeSessionId).toBeNull();
  });

  it("keeps full message list in memory before persist trim", () => {
    const messages = Array.from({ length: 9000 }, (_, i) => ({
      date: "1/1/24",
      time: "10:00",
      sender: "A",
      message: `m${i}`,
    }));
    useChatStore.getState().setChat("Big", messages, "whatsapp");
    expect(useChatStore.getState().sessions[0].messages).toHaveLength(9000);
    const trimmed = messages.slice(-8000);
    expect(trimmed).toHaveLength(8000);
  });
});
