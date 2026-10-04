/* MPL-2.0 */
export class EvaartaEmailTransportBridge {
  constructor({ sendMessage, receiveMessages }) {
    if (typeof sendMessage !== "function" || typeof receiveMessages !== "function") {
      throw new TypeError("email transport requires sendMessage and receiveMessages");
    }
    this.sendMessage = sendMessage;
    this.receiveMessages = receiveMessages;
  }

  async send(envelope, destination) {
    return this.sendMessage({
      destination,
      subject: "e-Vaarta project message",
      contentType: "application/evaarta+json",
      body: JSON.stringify(envelope),
    });
  }

  async receive() {
    const messages = await this.receiveMessages({ contentType: "application/evaarta+json" });
    return messages.map(message => typeof message.body === "string" ? JSON.parse(message.body) : message.body);
  }
}
