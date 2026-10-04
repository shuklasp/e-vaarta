/* MPL-2.0 */
export function chooseDeliveryPolicy({localPreferred=true}={}){return localPreferred?["wifi-lan","bluetooth","file-bundle","matrix","xmpp","whatsapp","arattai","email"]:["matrix","xmpp","whatsapp","arattai","email","file-bundle","wifi-lan","bluetooth"];}
export function shouldForward(envelope){return !!envelope&&envelope.hopLimit>0;}
