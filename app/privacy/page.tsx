import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | DevChat",
  description: "Privacy Policy for DevChat",
}

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>

      <div className="prose prose-sm dark:prose-invert">
        <p className="lead">
          At DevChat, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our service.
        </p>

        <h2>1. Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul>
          <li>Account information (name, email, password)</li>
          <li>Profile information (profile picture, status)</li>
          <li>Content you share (messages, files, code snippets)</li>
          <li>Information from third-party services (GitHub, Google)</li>
          <li>Device and usage information</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process and complete transactions</li>
          <li>Send you technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Develop new products and services</li>
          <li>Monitor and analyze trends and usage</li>
          <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
        </ul>

        <h2>3. End-to-End Encryption</h2>
        <p>
          DevChat uses end-to-end encryption for all messages. This means that your messages can only be read by you and
          the intended recipients. We cannot access the content of your encrypted messages.
        </p>

        <h2>4. Data Retention</h2>
        <p>
          We retain your information for as long as your account is active or as needed to provide you services. We will
          also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and
          enforce our agreements.
        </p>

        <h2>5. AI Features</h2>
        <p>When you use our AI features powered by Gemini AI:</p>
        <ul>
          <li>Your prompts are sent to Google's Gemini API for processing</li>
          <li>
            We do not store the content of your prompts or the AI responses beyond what's necessary for the immediate
            request
          </li>
          <li>You can use your own API key for additional privacy</li>
          <li>
            We maintain logs of AI usage for transparency and debugging purposes, but these logs do not contain the full
            content of your prompts
          </li>
        </ul>

        <h2>6. Transparency</h2>
        <p>
          We believe in full transparency. You can view detailed logs of all activities related to your account in the
          Logs section.
        </p>

        <h2>7. Information Sharing</h2>
        <p>We do not share your personal information with third parties except in the following circumstances:</p>
        <ul>
          <li>With your consent</li>
          <li>With service providers who process data on our behalf</li>
          <li>To comply with legal obligations</li>
          <li>To protect the rights and safety of DevChat and our users</li>
        </ul>

        <h2>8. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information. You can do this through your
          account settings or by contacting us directly.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page and updating the "Last Updated" date.
        </p>

        <h2>10. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@dishis.tech.</p>

        <p className="text-sm text-muted-foreground mt-8">Last updated: April 10, 2025</p>
        <p className="text-sm text-muted-foreground">DishIs Technologies, Bahadurgarh, Haryana, India</p>
      </div>
    </div>
  )
}
