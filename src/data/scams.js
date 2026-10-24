
export const scamPatterns = [
  {
    id: 'otp-request',
    title: 'OTP or PIN request',
    keywords: ['otp', 'one time password', 'upi pin', 'atm pin', 'password'],
    risk: 'high',
    explanation:
      'Legitimate bank staff should never ask you to disclose your OTP, PIN, or password.',
    advice:
      'Do not share the code. Contact your bank using its official app or verified phone number.',
  },
  {
    id: 'urgent-threat',
    title: 'Urgency or account threat',
    keywords: ['account will be blocked', 'blocked today', 'immediately', 'urgent', 'suspended'],
    risk: 'high',
    explanation:
      'Scammers often create panic so you act before verifying the request.',
    advice:
      'Pause. Check your account using your bank’s official app instead of following the message.',
  },
  {
    id: 'remote-access',
    title: 'Remote access request',
    keywords: ['screen sharing', 'remote access', 'install this app', 'anydesk', 'teamviewer'],
    risk: 'high',
    explanation:
      'Remote-access tools can expose sensitive information or let another person control your device.',
    advice:
      'Do not install an app or share your screen because an unsolicited caller asks you to.',
  },
  {
    id: 'payment-collect',
    title: 'Suspicious payment instruction',
    keywords: ['scan qr to receive', 'enter pin to receive', 'collect request', 'approve collect'],
    risk: 'high',
    explanation:
      'Approving a payment request or entering a UPI PIN can authorize money leaving your account.',
    advice:
      'Do not approve unexpected payment requests. Verify the purpose and recipient independently.',
  },
  {
    id: 'prize-claim',
    title: 'Unexpected prize or reward',
    keywords: ['you won a prize', 'claim your reward', 'lottery winner', 'processing fee'],
    risk: 'medium',
    explanation:
      'Unexpected rewards that require a fee or sensitive details can be a fraud tactic.',
    advice:
      'Verify the offer through the organization’s official website before paying or sharing details.',
  },
]
