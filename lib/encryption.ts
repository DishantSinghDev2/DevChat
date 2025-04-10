import crypto from "crypto"

// Generate RSA key pair for E2EE
export const generateKeyPair = async () => {
  return new Promise<{ publicKey: string; privateKey: string }>((resolve, reject) => {
    crypto.generateKeyPair(
      "rsa",
      {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      },
      (err, publicKey, privateKey) => {
        if (err) {
          reject(err)
        } else {
          resolve({ publicKey, privateKey })
        }
      },
    )
  })
}

// Encrypt message with recipient's public key
export const encryptMessage = async (message: string, publicKey?: string) => {
  // For demo purposes, we'll use a simple encryption
  // In a real app, you would use the recipient's public key

  const algorithm = "aes-256-cbc"
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || "default-key", "salt", 32)
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(message, "utf8", "hex")
  encrypted += cipher.final("hex")

  return JSON.stringify({
    iv: iv.toString("hex"),
    content: encrypted,
  })
}

// Decrypt message with user's private key
export const decryptMessage = async (encryptedData: string, privateKey?: string) => {
  // For demo purposes, we'll use a simple decryption
  // In a real app, you would use the user's private key

  const { iv, content } = JSON.parse(encryptedData)

  const algorithm = "aes-256-cbc"
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || "default-key", "salt", 32)

  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, "hex"))

  let decrypted = decipher.update(content, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
