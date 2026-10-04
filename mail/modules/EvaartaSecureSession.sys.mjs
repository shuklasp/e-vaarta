/* MPL-2.0 */
export const EvaartaSessionState = Object.freeze({
  IDLE: "idle",
  HELLO_SENT: "hello-sent",
  AUTHENTICATED: "authenticated",
  CLOSED: "closed",
});

export class EvaartaSecureSession {
  constructor({ identity, crypto, peer, nonceFactory = () => crypto?.randomNonce?.() ?? crypto?.nonce?.() ?? crypto?.randomBytes?.(32) }) {
    this.identity = identity;
    this.crypto = crypto;
    this.peer = peer;
    this.nonceFactory = nonceFactory;
    this.state = EvaartaSessionState.IDLE;
    this.localNonce = null;
    this.remoteNonce = null;
  }

  async createHello() {
    if (this.state !== EvaartaSessionState.IDLE) throw new Error("invalid session state");
    this.localNonce = await this.nonceFactory();
    const hello = {
      protocol: "e-vaarta-session",
      version: 1,
      actorId: this.identity.actorId,
      fingerprint: this.identity.fingerprint,
      nonce: this.localNonce,
    };
    const signature = await this.crypto.sign(JSON.stringify(hello), this.identity);
    this.state = EvaartaSessionState.HELLO_SENT;
    return { ...hello, signature };
  }

  async acceptHello(hello) {
    if (this.state !== EvaartaSessionState.IDLE) throw new Error("invalid session state");
    if (hello?.version !== 1 || hello.actorId !== this.peer.actorId) {
      throw new Error("peer hello does not match trusted identity");
    }
    const unsigned = { ...hello };
    delete unsigned.signature;
    if (!await this.crypto.verify(JSON.stringify(unsigned), hello.signature, this.peer)) {
      throw new Error("peer authentication failed");
    }
    this.remoteNonce = hello.nonce;
    this.localNonce = await this.nonceFactory();
    const response = {
      protocol: "e-vaarta-session",
      version: 1,
      actorId: this.identity.actorId,
      fingerprint: this.identity.fingerprint,
      nonce: this.localNonce,
      challenge: hello.nonce,
    };
    response.signature = await this.crypto.sign(JSON.stringify(response), this.identity);
    this.state = EvaartaSessionState.AUTHENTICATED;
    return response;
  }

  async finish(response) {
    if (this.state !== EvaartaSessionState.HELLO_SENT) throw new Error("invalid session state");
    if (response?.challenge !== this.localNonce || response.actorId !== this.peer.actorId) {
      throw new Error("session challenge mismatch");
    }
    const unsigned = { ...response };
    delete unsigned.signature;
    if (!await this.crypto.verify(JSON.stringify(unsigned), response.signature, this.peer)) {
      throw new Error("peer session signature invalid");
    }
    this.remoteNonce = response.nonce;
    this.state = EvaartaSessionState.AUTHENTICATED;
  }

  close() {
    this.state = EvaartaSessionState.CLOSED;
    this.localNonce = this.remoteNonce = null;
  }
}
