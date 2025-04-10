import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | DevChat",
  description: "Terms of Service for DevChat",
}

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-6 text-3xl font-bold">Terms of Service</h1>

      <div className="prose prose-sm dark:prose-invert">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using DevChat, you agree to be bound by these Terms of Service and all applicable laws and
          regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this
          site.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use DevChat for personal, non-commercial transitory viewing only. This is
          the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul>
          <li>modify or copy the materials;</li>
          <li>use the materials for any commercial purpose;</li>
          <li>attempt to decompile or reverse engineer any software contained in DevChat;</li>
          <li>remove any copyright or other proprietary notations from the materials; or</li>
          <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>

        <h2>3. Disclaimer</h2>
        <p>
          The materials on DevChat are provided on an 'as is' basis. DevChat makes no warranties, expressed or implied,
          and hereby disclaims and negates all other warranties including, without limitation, implied warranties or
          conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property
          or other violation of rights.
        </p>

        <h2>4. Limitations</h2>
        <p>
          In no event shall DevChat or its suppliers be liable for any damages (including, without limitation, damages
          for loss of data or profit, or due to business interruption) arising out of the use or inability to use
          DevChat, even if DevChat or a DevChat authorized representative has been notified orally or in writing of the
          possibility of such damage.
        </p>

        <h2>5. Privacy</h2>
        <p>
          Your use of DevChat is also governed by our Privacy Policy, which is incorporated by reference into these
          Terms of Service.
        </p>

        <h2>6. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of India and you
          irrevocably submit to the exclusive jurisdiction of the courts in Bahadurgarh, Haryana, India.
        </p>

        <h2>7. Changes to Terms</h2>
        <p>
          DevChat reserves the right, at its sole discretion, to modify or replace these Terms at any time. What
          constitutes a material change will be determined at our sole discretion.
        </p>

        <h2>8. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us at legal@dishis.tech.</p>

        <p className="text-sm text-muted-foreground mt-8">Last updated: April 10, 2025</p>
      </div>
    </div>
  )
}
