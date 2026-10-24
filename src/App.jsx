
import { useEffect, useState } from 'react'
import { customers } from './data/customers.js'
import { paymentConfig } from './data/config.js'
import { initialPayees } from './data/payees.js'
import { initialTransactions } from './data/transactions.js'
import { analyzeScamMessage } from './utils/scamAnalyzer.js'
import { scamPatterns } from './data/scams.js'
import en from './i18n/en.js'
import hi from './i18n/hi.js'

// const customers = [
//   { id: 'shankar', name: 'Shankar', age: 68, description: 'Simple banking experience', initials: 'S', mode: 'simple', balancePaise: 2456800 },
//   { id: 'priya', name: 'Priya', age: 32, description: 'Everyday banking', initials: 'P', mode: 'standard', balancePaise: 8245500 },
//   { id: 'aarav', name: 'Aarav', age: 15, description: 'Young saver account', initials: 'A', mode: 'young', balancePaise: 1250000 },
// ]

const navigation = [
  { id: 'Home', label: 'home', icon: '⌂' },
  { id: 'Pay', label: 'pay', icon: '↗' },
  { id: 'History', label: 'history', icon: '↻' },
  { id: 'Services', label: 'services', icon: '▦' },
  { id: 'Help', label: 'help', icon: '?' },
]

const formatMoney = (paise) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(paise / 100)

function translateTransactionTitle(title, language) {
  const hindiTitles = {
    'Grocery shopping': 'किराने की खरीदारी',
    'Money received': 'धन प्राप्त हुआ',
    'Electricity bill': 'बिजली का बिल',
    'Daily essentials': 'रोज़मर्रा की ज़रूरतें',
    'Pension credited': 'पेंशन जमा हुई',
    'Pharmacy purchase': 'दवा की खरीदारी',
    'Salary credited': 'वेतन जमा हुआ',
    'Money transferred': 'पैसे ट्रांसफर किए गए',
    'Supermarket purchase': 'सुपरमार्केट से खरीदारी',
    'Mobile bill': 'मोबाइल बिल',
    'Pocket money received': 'जेब खर्च',
    'Canteen purchase': 'कैंटीन से खरीदारी',
    'School books': 'स्कूल की किताबें',
    'Sports supplies': 'खेल का सामान',
  }

  if (language !== 'hi') return title

  if (title.startsWith('Payment to ')) {
    return `${title.slice('Payment to '.length)} को भुगतान`
  }

  return hindiTitles[title] || title
}

function loadDemoData(key, fallback) {
  try {
    const saved = localStorage.getItem(key)

    if (saved === null) {
      return fallback
    }

    return JSON.parse(saved)
  } catch {
    return fallback
  }
}


function App() {
  const [language, setLanguage] = useState(
  () => localStorage.getItem('saral-language') || 'en'
)

  const t = language === 'hi' ? hi : en
  const [scamMessage, setScamMessage] = useState('')
  const [scamResult, setScamResult] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0])
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [signedIn, setSignedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('Home')

  const [historySearch, setHistorySearch] = useState('')
  const [historyType, setHistoryType] = useState('all')

  const [balanceVisible, setBalanceVisible] = useState(true)
  

  
const [balances, setBalances] = useState(() =>
  loadDemoData(
    'saral-balances-v1',
    Object.fromEntries(customers.map((c) => [c.id, c.balancePaise]))
  )
)

const [transactions, setTransactions] = useState(() =>
  loadDemoData('saral-transactions-v2', initialTransactions)
)

const [payees, setPayees] = useState(() =>
  loadDemoData('saral-payees-v1', initialPayees)
)


  const [paymentStep, setPaymentStep] = useState('recipient')
  const [recipientId, setRecipientId] = useState('')
  const [newRecipientName, setNewRecipientName] = useState('')
  const [newRecipientAccount, setNewRecipientAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false)
  const [urgentRequest, setUrgentRequest] = useState('')
  const [paymentPin, setPaymentPin] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [guardianPending, setGuardianPending] = useState(false)


useEffect(() => {
  try {
    localStorage.setItem('saral-balances-v1', JSON.stringify(balances))
  } catch {
    console.error('Could not save demo balances.')
  }
}, [balances])

useEffect(() => {
  try {
    localStorage.setItem('saral-transactions-v1', JSON.stringify(transactions))
  } catch {
    console.error('Could not save demo transactions.')
  }
}, [transactions])

useEffect(() => {
  try {
    localStorage.setItem('saral-payees-v1', JSON.stringify(payees))
  } catch {
    console.error('Could not save demo recipients.')
  }
}, [payees])


  const simpleMode = selectedCustomer.mode === 'simple'
  const balancePaise = balances[selectedCustomer.id]
  const myTransactions = transactions.filter(
    (t) => t.customerId === selectedCustomer.id
  )

  const selectedPayee = payees.find((p) => p.id === recipientId)
  const isNewPayee = recipientId === 'new'
  const amountPaise = Math.round(Number(amount) * 100)
  const isValidAmount =
  amount !== '' &&
  Number.isFinite(Number(amount)) &&
  Number(amount) > 0 &&
  Number(amountPaise) > 0 &&
  amountPaise <= paymentConfig.maxPaymentPaise &&
  Number.isSafeInteger(amountPaise)

  function resetPayment() {
    setPaymentStep('recipient')
    setRecipientId('')
    setNewRecipientName('')
    setNewRecipientAccount('')
    setAmount('')
    setNote('')
    setPaymentError('')
    setSafetyAcknowledged(false)
    setUrgentRequest('')
    setPaymentPin('')
    setReceipt(null)
    setGuardianPending(false)
  }

  function openPay() {
    resetPayment()
    setActiveTab('Pay')
  }

  function handleSignIn(event) {
    event.preventDefault()
    if (pin !== paymentConfig.demoPin) {
      setError('Incorrect demo PIN. Please try again.')
      return
    }
    setError('')
    setSignedIn(true)
    setActiveTab('Home')
  }

  function selectCustomer(customer) {
    setSelectedCustomer(customer)
    setPin('')
    setError('')
    setSignedIn(false)
    setActiveTab('Home')
    resetPayment()
  }

  function signOut() {
    setSignedIn(false)
    setPin('')
    setError('')
    resetPayment()
  }

  function continueToReview(event) {
    event.preventDefault()
    setPaymentError('')

    if (isNewPayee) {
      const cleanName = newRecipientName.trim()
      const cleanAccount = newRecipientAccount.replace(/\s/g, '')

      if (cleanName.length < 2) {
        setPaymentError('Enter the recipient’s registered name.')
        return
      }
      if (!/^\d{4,18}$/.test(cleanAccount)) {
        setPaymentError('Enter a demo account number with 4 to 18 digits.')
        return
      }
      if (cleanAccount === '0000') {
        setPaymentError('Please use a different demo account number.')
        return
      }
    } else if (!selectedPayee) {
      setPaymentError('Choose a recipient to continue.')
      return
    }

    if (!isValidAmount) {
      setPaymentError('Enter an amount greater than ₹0 and no more than ₹10,00,000.')
      return
    }
    const recipientIsNew = isNewPayee || Boolean(selectedPayee?.isNew)

    if (recipientIsNew && amountPaise > paymentConfig.newPayeeLimitPaise) {
      setPaymentError('The demo limit for a new recipient is ₹10,000.')
      return
    }

    if (amountPaise > balancePaise) {
      setPaymentError(t.insufficientDemoBalance)
      return
    }

    setPaymentStep('review')
  }

  function continueToSafety() {
    setPaymentError('')
    setPaymentStep('safety')
  }

  function continueToPin() {
    setPaymentError('')

    const recipientIsNew =
    isNewPayee || Boolean(selectedPayee?.isNew)

    if (urgentRequest === 'yes') {
      setPaymentError(
        'Stop. Do not send money because someone called or messaged you. Verify the request independently.'
      )
      return
    }

    if (urgentRequest !== 'no') {
      setPaymentError('Please answer the safety question.')
      return
    }

    if (!safetyAcknowledged) {
      setPaymentError('Please confirm that you checked the recipient and amount.')
      return
    }

    if (recipientIsNew && amountPaise > paymentConfig.newPayeeLimitPaise) {
      setPaymentError('The demo limit for a new recipient is ₹10,000.')
      return
    }

    setPaymentStep('pin')
  }

  function completePayment(event) {
    event.preventDefault()
    setPaymentError('')
    const recipientIsNew = isNewPayee || Boolean(selectedPayee?.isNew)
    if (urgentRequest !== 'no') {
      setPaymentError(
        t.verifyPaymentIndependently
      )
      return
    }

    if (!safetyAcknowledged) {
      setPaymentError(
        t.confirmRecipientAndAmount
      )
      return
    }

    if (!isValidAmount) {
      setPaymentError(
        t.validPaymentAmount
      )
      return
    }

if (recipientIsNew && amountPaise > paymentConfig.newPayeeLimitPaise) {
  setPaymentError(t.newRecipientDemoLimit)
  return
}

    if (paymentPin !== paymentConfig.demoPin) {
      setPaymentError(t.incorrectDemoPin)
      return
    }

    const finalName = isNewPayee ? newRecipientName.trim() : selectedPayee?.name

    if (!finalName) {
      setPaymentError(t.recipientDetailsMissing)
      return
    }

    if (amountPaise <= 0 || amountPaise > balances[selectedCustomer.id]) {
      setPaymentError(t.paymentAmountInvalid)
      return
    }

    let finalPayee = selectedPayee

    if (isNewPayee) {
      finalPayee = {
        id: `r-${Date.now()}`,
        name: finalName,
        account: `•••• ${newRecipientAccount.slice(-4)}`,
        isNew: true,
      }
      setPayees((previous) => [...previous, finalPayee])
    }

    const now = new Date()
    const date = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Aarav's payments above ₹2,000 require simulated guardian approval.
    if (selectedCustomer.mode === 'young' && amountPaise > paymentConfig.youngAccountApprovalThresholdPaise) {
      const pendingReceipt = {
        id: `DEMO-${Date.now()}`,
        recipient: finalName,
        account: finalPayee?.account || `•••• ${newRecipientAccount.slice(-4)}`,
        amountPaise,
        date,
        status: 'Pending guardian approval',
        note: note.trim(),
      }

      setReceipt(pendingReceipt)
      setGuardianPending(true)
      setPaymentStep('receipt')
      setPaymentPin('')
      return
    }

    const nextBalance = balances[selectedCustomer.id] - amountPaise
    setBalances((previous) => ({
      ...previous,
      [selectedCustomer.id]: nextBalance,
    }))

    const newTransaction = {
      id: `t-${Date.now()}`,
      customerId: selectedCustomer.id,
      title: `Payment to ${finalName}`,
      date,
      amountPaise,
      type: 'debit',
      status: 'Completed',
      note: note.trim(),
    }
    setTransactions((previous) => [newTransaction, ...previous])

    setReceipt({
      id: `DEMO-${Date.now()}`,
      recipient: finalName,
      account: finalPayee?.account || `•••• ${newRecipientAccount.slice(-4)}`,
      amountPaise,
      date,
      status: 'Successful (demo only)',
      note: note.trim(),
    })
    setPaymentStep('receipt')
    setPaymentPin('')
  }

function resetDemoData() {
  const confirmed = window.confirm(
    'Reset all demo balances, recipients and transactions to their original values?'
  )

  if (!confirmed) return

  setBalances(
    Object.fromEntries(customers.map((c) => [c.id, c.balancePaise]))
  )
  setTransactions(initialTransactions)
  setPayees(initialPayees)

  resetPayment()
  setActiveTab('Home')
  setHistorySearch('')
  setHistoryType('all')
}

  
  function renderHome() {
    return (
      <>
        <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
          <span className="font-semibold text-slate-700">{t.language}</span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setLanguage('en')
                localStorage.setItem('saral-language', 'en')
              }}
              className={`min-h-10 rounded-lg px-4 font-semibold ${
                language === 'en'
                  ? 'bg-teal-800 text-white'
                  : 'border border-slate-300 text-slate-700'
              }`}
              aria-pressed={language === 'en'}
            >
              English
            </button>

            <button
              type="button"
              onClick={() => {
                setLanguage('hi')
                localStorage.setItem('saral-language', 'hi')
              }}
              className={`min-h-10 rounded-lg px-4 font-semibold ${
                language === 'hi'
                  ? 'bg-teal-800 text-white'
                  : 'border border-slate-300 text-slate-700'
              }`}
              aria-pressed={language === 'hi'}
            >
              हिन्दी
            </button>
          </div>
        </div>

        <section className="rounded-2xl bg-teal-800 p-5 text-white shadow-sm sm:p-6">

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-teal-100">
                {t.balance.toUpperCase()} · DEMO
              </p>
              <p className="mt-2 text-3xl font-bold sm:text-4xl">
                {balanceVisible ? formatMoney(balancePaise) : '₹ ••••••'}
              </p>
              <p className="mt-3 text-sm text-teal-100">
               {language === 'hi' ? 'डेमो खाता' : 'Demo account'} · •••• 4821
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBalanceVisible(!balanceVisible)}
              aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
              className="min-h-12 min-w-12 rounded-xl border border-teal-500 px-3 text-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {balanceVisible ? '◉' : '◎'}
            </button>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-bold">
            {language === 'hi' ? 'आप क्या करना चाहेंगे?' : 'What would you like to do?'}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { label: t.sendMoney, icon: '↗', action: openPay },
  {
    label: language === 'hi' ? 'लेन-देन देखें' : 'View history',
    icon: '↻',
    action: () => setActiveTab('History'),
  },
  {
    label: language === 'hi' ? 'बैंक सेवाएँ' : 'Bank services',
    icon: '▦',
    action: () => setActiveTab('Services'),
  },
  {
    label: language === 'hi' ? 'सहायता प्राप्त करें' : 'Get help',
    icon: '?',
    action: () => setActiveTab('Help'),
  },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className={`flex min-h-24 flex-col items-start justify-center rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-teal-600 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${simpleMode ? 'min-h-28 text-lg' : ''}`}
              >
                <span aria-hidden="true" className="text-2xl text-teal-800">{item.icon}</span>
                <span className="mt-2 font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{t.recentTransactions}</h2>
            <button
              type="button"
              onClick={() => setActiveTab('History')}
              className="min-h-11 rounded-lg px-2 text-sm font-semibold text-teal-800 underline underline-offset-4"
            >
              {t.viewAll}
            </button>
          </div>
          <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-4">
            {myTransactions.slice(0, 4).map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-3 py-4">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg">
                  {transaction.type === 'credit' ? '↓' : '↑'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
  {translateTransactionTitle(transaction.title, language)}
</p>
                  <p className="mt-1 text-sm text-slate-500">{transaction.date}</p>
                  {transaction.status && (
  <p className="mt-1 text-xs text-slate-500">
    {language === 'hi' && transaction.status === 'Completed'
      ? t.completed
      : transaction.status}
  </p>
)}
                </div>
                <p className={`whitespace-nowrap text-sm font-bold ${transaction.type === 'credit' ? 'text-green-700' : ''}`}>
                  {transaction.type === 'credit' ? '+' : '−'}{formatMoney(transaction.amountPaise)}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">{t.fictionalBalancesNotice}</p>
          <button
  type="button"
  onClick={resetDemoData}
  className="mt-4 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-100"
>
  {t.resetDemoData}
</button>
        </section>

        {selectedCustomer.mode === 'young' && (
          <section className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <h2 className="font-bold text-amber-950">{t.youngSaverAccount}</h2>
            <p className="mt-1 text-sm text-amber-900">{t.guardianApprovalNotice}</p>
          </section>
        )}
      </>
    )
  }

  function renderPayment() {
    const steps = [
      { id: 'recipient', label: t.recipientStep },
      { id: 'review', label: t.reviewStep },
      { id: 'safety', label: t.safetyStep },
      { id: 'pin', label: t.confirmStep },
      { id: 'receipt', label: t.receiptStep },
    ]
    const currentIndex = steps.findIndex((step) => step.id === paymentStep)

    if (paymentStep === 'receipt' && receipt) {
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-3xl text-teal-800">
            {guardianPending ? '⌛' : '✓'}
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold">
            {guardianPending ? t.approvalNeeded : t.demoPaymentComplete}
          </h2>
          <p className="mt-2 text-center text-slate-600">
            {guardianPending
              ? t.paymentNotSent
              : t.simulatedPayment}
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{t.paymentAmount}</p>
            <p className="mt-1 text-3xl font-bold">{formatMoney(receipt.amountPaise)}</p>
            <div className="mt-5 space-y-4">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">{t.recipient}</span>
                <span className="text-right font-semibold">{receipt.recipient}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">{t.account}</span>
                <span className="font-semibold">{receipt.account}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">{t.reference}</span>
                <span className="break-all text-right font-semibold">{receipt.id}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">{t.status}</span>
                <span className="text-right font-semibold">{receipt.status}</span>
              </div>
              {receipt.note && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">{t.note}</span>
                  <span className="text-right">{receipt.note}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              resetPayment()
              setActiveTab('Home')
            }}
            className="mt-5 min-h-12 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {t.backToHome}
          </button>
          <button
            type="button"
            onClick={openPay}
            className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-semibold"
          >
            {t.anotherPayment}
          </button>
        </section>
      )
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-2xl font-bold">{t.paymentTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">{t.demoPaymentNotice}</p>

        <div className="mt-5 grid grid-cols-5 gap-1" aria-label="Payment progress">
          {steps.map((step, index) => (
            <div key={step.id} className={`rounded-lg px-1 py-2 text-center text-xs ${index <= currentIndex ? 'bg-teal-100 font-semibold text-teal-900' : 'bg-slate-100 text-slate-500'}`}>
              {step.label}
            </div>
          ))}
        </div>

        {paymentStep === 'recipient' && (
          <form onSubmit={continueToReview} className="mt-6 space-y-5">
            <div>
              <label htmlFor="recipient" className="block font-semibold">{t.whoAreYouPaying}</label>
              <select
                id="recipient"
                value={recipientId}
                onChange={(event) => {
                  setRecipientId(event.target.value)
                  setPaymentError('')
                }}
                required
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3"
              >
                <option value=""> {t.chooseRecipient} </option>
                {payees.map((payee) => (
                  <option key={payee.id} value={payee.id}>{payee.name} · {payee.account}</option>
                ))}
                <option value="new">{t.addNewRecipient}</option>
              </select>
            </div>

            {isNewPayee && (
              <div className="space-y-4 rounded-xl bg-slate-50 p-4">
                <div>
                  <label htmlFor="new-name" className="block font-semibold">{t.registeredName}</label>
                  <input
                    id="new-name"
                    value={newRecipientName}
                    onChange={(event) => setNewRecipientName(event.target.value)}
                    maxLength={60}
                    autoComplete="off"
                    placeholder={t.exampleName}
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-account" className="block font-semibold">{t.demoAccountNumber}</label>
                  <input
                    id="new-account"
                    value={newRecipientAccount}
                    onChange={(event) => setNewRecipientAccount(event.target.value.replace(/\D/g, '').slice(0, 18))}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={t.accountDigitsPlaceholder}
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3"
                    required
                  />
                  <p className="mt-1 text-sm text-slate-500">{t.fictionalDigitsNotice}</p>
                </div>
                <p className="text-sm font-medium text-amber-900">{t.newRecipientLimit}</p>
              </div>
            )}

            <div>
              <label htmlFor="amount" className="block font-semibold">{t.amountRupees}</label>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                max={paymentConfig.maxPaymentPaise / 100}
                step="0.01"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value)
                  setPaymentError('')
                }}
                placeholder={t.exampleAmount}
                required
                className="mt-2 min-h-14 w-full rounded-xl border border-slate-300 px-4 text-xl"
              />
              <p className="mt-1 text-sm text-slate-500">{t.availableDemoBalance}: {formatMoney(balancePaise)}</p>
            </div>

            <div>
              <label htmlFor="note" className="block font-semibold">{t.optionalNote}</label>
              <input
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={80}
                placeholder={t.exampleNote}
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3"
              />
            </div>

            {paymentError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{paymentError}</p>}

            <button type="submit" className="min-h-12 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800">
              {t.reviewPayment}
            </button>
          </form>
        )}

        {paymentStep === 'review' && (
          <div className="mt-6">
            <h3 className="text-lg font-bold">{t.checkDetails}</h3>
            <div className="mt-4 space-y-4 rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between gap-3"><span className="text-slate-500">{t.recipientName}</span><span className="text-right font-semibold">{isNewPayee ? newRecipientName.trim() : selectedPayee?.name}</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">{t.demoAccount}</span><span className="text-right font-semibold">{isNewPayee ? `•••• ${newRecipientAccount.slice(-4)}` : selectedPayee?.account}</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">{t.amountLabel}</span><span className="font-bold">{formatMoney(amountPaise)}</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">{t.demoFee}</span><span className="font-semibold">{formatMoney(0)}</span></div>
              {note.trim() && <div className="flex justify-between gap-3"><span className="text-slate-500">{t.optionalNote}</span><span className="text-right">{note.trim()}</span></div>}
            </div>
            <p className="mt-4 text-sm text-slate-600">{t.verifyNameAndAmount}</p>
            <button type="button" onClick={continueToSafety} className="mt-5 min-h-12 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white">{t.continueSafety}</button>
            <button type="button" onClick={() => setPaymentStep('recipient')} className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-semibold">{t.goBackEdit}</button>
          </div>
        )}

        {paymentStep === 'safety' && (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 sm:p-6">
  <div className="flex items-start gap-3">
    <span
      aria-hidden="true"
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-200 text-2xl"
    >
      ⚠️
    </span>

    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
        {t.safetyFirst}
      </p>
      <h3 className="mt-1 text-xl font-bold text-amber-950">
        {t.pauseBeforePay}
      </h3>
      <p className="mt-2 leading-6 text-amber-950">
        {t.scamWarningIntro}
      </p>
    </div>
  </div>

  <div className="mt-4 space-y-3 rounded-xl bg-white p-4 text-sm text-slate-800">
    <p><strong>{t.neverShare}:</strong> {t.pinOtpPasswords}</p>
    <p><strong>{t.verifyIndependently}:</strong> {t.trustedContactAdvice}</p>
    <p><strong>{t.demoMoneyReminder}:</strong> {t.safetyChecksIntro}</p>
  </div>
</div>

            
<div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 sm:p-5">
  <div className="flex items-start gap-3">
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-xl"
    >
      🛡️
    </span>

    <div className="min-w-0">
      <p className="font-bold text-teal-950">{t.safetyCoach}</p>
      <p className="mt-1 text-sm leading-6 text-teal-900">
        {t.safetyChecksIntro}
      </p>
    </div>
  </div>

  <ul className="mt-4 space-y-3 text-sm text-slate-800">
    {(isNewPayee || Boolean(selectedPayee?.isNew)) && (
      <li className="flex items-start gap-2">
        <span aria-hidden="true">⚠️</span>
        <span>
          <strong>{t.newRecipientWarning}:</strong> {t.newRecipientAdvice}
        </span>
      </li>
    )}

    {amountPaise > paymentConfig.maxPaymentPaise && (
      <li className="flex items-start gap-2">
        <span aria-hidden="true">⚠️</span>
        <span>
          <strong>{t.highValueWarning}:</strong> {t.highValueAdvice}
        </span>
      </li>
    )}

    {selectedCustomer.mode === 'young' && amountPaise > paymentConfig.youngAccountApprovalThresholdPaise && (
      <li className="flex items-start gap-2">
        <span aria-hidden="true">👪</span>
        <span>
          <strong>{t.guardianReview}:</strong> {t.guardianPendingAdvice}
        </span>
      </li>
    )}

    <li className="flex items-start gap-2">
      <span aria-hidden="true">✓</span>
      <span>
        {t.pressureWarning}
      </span>
    </li>
  </ul>
</div>


<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
  <div className="flex items-start gap-3">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-xl">
      🛡️
    </span>
    <div>
      <h3 className="font-bold text-slate-900">{t.scamShield}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        {t.scamShieldDescription}
      </p>
    </div>
  </div>

  <label htmlFor="scam-message" className="mt-4 block text-sm font-semibold">
    {t.pasteSuspiciousMessage}
  </label>
  <textarea
    id="scam-message"
    value={scamMessage}
    onChange={(event) => {
      setScamMessage(event.target.value)
      setScamResult(null)
    }}
    rows={4}
    maxLength={2000}
    placeholder={t.scamExample}
    className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
  />

  <p className="mt-1 text-xs text-slate-500">
    {t.scamDemoPrivacy}
  </p>

  <button
    type="button"
    onClick={() => setScamResult(analyzeScamMessage(scamMessage))}
    disabled={!scamMessage.trim()}
    className="mt-4 min-h-12 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {t.analyzeMessage}
  </button>

  {scamResult && (
    <div
      aria-live="polite"
      className={`mt-4 rounded-xl border p-4 ${
        scamResult.risk === 'high'
          ? 'border-red-200 bg-red-50'
          : scamResult.risk === 'medium'
            ? 'border-amber-200 bg-amber-50'
            : 'border-teal-200 bg-teal-50'
      }`}
    >
      <h4 className="font-bold text-slate-900">
        {scamResult.risk === 'high'
          ? t.highRiskSigns
          : scamResult.risk === 'medium'
            ? t.warningSignsFound
            : scamResult.risk === 'low'
              ? t.noKnownPatterns
              : t.messageCheck}
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-800">
        {language === 'hi' &&
scamResult.summary === 'Enter a message to check for warning signs.'
  ? t.enterMessageToCheck
  : scamResult.summary}
      </p>

      {scamResult.matches.length > 0 && (
        <ul className="mt-3 space-y-3">
          {scamResult.matches.map((pattern) => (
            <li key={pattern.id} className="text-sm">
              <p className="font-semibold">{language === 'hi'
      ? ({
          'otp-request': t.otpRequestTitle,
          'urgent-threat': t.urgentThreatTitle,
          'remote-access': t.remoteAccessTitle,
          'payment-collect': t.suspiciousPaymentTitle,
          'prize-claim': t.unexpectedPrizeTitle,
        }[pattern.id] || pattern.title)
      : pattern.title}</p>
              <p className="mt-1 leading-5 text-slate-700">
                {language === 'hi'
      ? ({
          'otp-request': t.otpRequestExplanation,
          'urgent-threat': t.urgentThreatExplanation,
          'remote-access': t.remoteAccessExplanation,
          'payment-collect': t.suspiciousPaymentExplanation,
          'prize-claim': t.unexpectedPrizeExplanation,
        }[pattern.id] || pattern.explanation)
      : pattern.explanation}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-sm leading-6 text-slate-800">
  <strong>{t.saferNextStep}:</strong>{' '}
  {language === 'hi'
    ? ({
        'otp-request': t.otpRequestAdvice,
        'urgent-threat': t.urgentThreatAdvice,
        'remote-access': t.remoteAccessAdvice,
        'payment-collect': t.suspiciousPaymentAdvice,
        'prize-claim': t.unexpectedPrizeAdvice,
      }[scamResult.matches[0]?.id] || scamResult.advice)
    : scamResult.advice}
</p>

      <p className="mt-3 text-xs text-slate-600">
        {t.scamCheckerDisclaimer}
      </p>
    </div>
  )}
</div>


            <fieldset>
              <legend className="font-semibold">{t.urgentRequestQuestion}</legend>
              <div className="mt-3 space-y-3">
                <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <input type="radio" name="urgent-request" value="yes" checked={urgentRequest === 'yes'} onChange={(event) => { setUrgentRequest(event.target.value); setPaymentError('') }} />
                  <span>{t.urgentRequestYes}</span>
                </label>
                <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <input type="radio" name="urgent-request" value="no" checked={urgentRequest === 'no'} onChange={(event) => { setUrgentRequest(event.target.value); setPaymentError('') }} />
                  <span>{t.urgentRequestNo}</span>
                </label>
              </div>
            </fieldset>

            {isNewPayee && (
              <div className="rounded-xl border border-amber-200 p-3 text-sm">
                <strong>{t.newRecipientSafety}</strong> {t.verifyRecipientAdvice}
              </div>
            )}
            {amountPaise > paymentConfig.maxPaymentPaise && (
              <div className="rounded-xl border border-amber-200 p-3 text-sm">
                <strong>{t.largePayment}</strong> {t.checkAmountAdvice}
              </div>
            )}

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
              <input type="checkbox" checked={safetyAcknowledged} onChange={(event) => { setSafetyAcknowledged(event.target.checked); setPaymentError('') }} className="mt-1" />
              <span>{t.safetyAcknowledgement}</span>
            </label>

            {paymentError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{paymentError}</p>}
            <button type="button" onClick={continueToPin} className="min-h-12 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white">{t.continueDemoPin}</button>
            <button type="button" onClick={() => setPaymentStep('review')} className="min-h-12 w-full rounded-xl border border-slate-300 px-4 font-semibold">{t.backToReview}</button>
          </div>
        )}

        {paymentStep === 'pin' && (
          <form onSubmit={completePayment} className="mt-6">
            <h3 className="text-lg font-bold">{t.confirmDemoPaymentTitle}</h3>
            <p className="mt-2 text-slate-600">{t.simulatingPayment} <strong>{formatMoney(amountPaise)}</strong> {t.to} <strong>{isNewPayee ? newRecipientName.trim() : selectedPayee?.name}</strong>.</p>
            <label htmlFor="payment-pin" className="mt-5 block font-semibold">{t.enterDemoPin}</label>
            <input
              id="payment-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              pattern="[0-9]{4}"
              maxLength={4}
              required
              value={paymentPin}
              onChange={(event) => { setPaymentPin(event.target.value.replace(/\D/g, '').slice(0, 4)); setPaymentError('') }}
              placeholder={t.demoPinPlaceholder}
              className="mt-2 min-h-14 w-full rounded-xl border border-slate-300 px-4 text-xl tracking-[0.4em]"
            />
            <p className="mt-2 text-sm text-slate-500">{t.demoPinHelp}</p>
            {paymentError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{paymentError}</p>}
            <button type="submit" className="mt-5 min-h-12 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white">{t.confirmDemoPayment}</button>
            <button type="button" onClick={() => setPaymentStep('safety')} className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-semibold">{t.backToSafety}</button>
          </form>
        )}
      </section>
    )
  }

function downloadCsvStatement() {
  const headers = [
    'Date',
    'Description',
    'Type',
    'Amount (INR)',
    'Status',
    'Note',
  ]

  const rows = myTransactions.map((transaction) => [
    transaction.date,
    transaction.title,
    transaction.type === 'credit' ? 'Money received' : 'Money sent or spent',
    (transaction.amountPaise / 100).toFixed(2),
    transaction.status || 'Completed',
    transaction.note || '',
  ])

  // Escape commas, quotes and line breaks correctly for CSV.
  const escapeCsvCell = (value) =>
    `"${String(value ?? '').replace(/"/g, '""')}"`

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n')

  // BOM helps Excel display Hindi and the rupee symbol correctly.
  const blob = new Blob(['\uFEFF', csvContent], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const safeName = selectedCustomer.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  link.href = url
  link.download = `saral-statement-${safeName}.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}  


function renderHistory() {
  const filteredTransactions = myTransactions.filter((transaction) => {
    const searchText = [
      transaction.title,
      transaction.date,
      transaction.status || '',
      transaction.note || '',
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch = searchText.includes(
      historySearch.trim().toLowerCase()
    )

    const matchesType =
      historyType === 'all' || transaction.type === historyType

    return matchesSearch && matchesType
  })

  const totalMoneyIn = myTransactions
    .filter((transaction) => transaction.type === 'credit')
    .reduce((total, transaction) => total + transaction.amountPaise, 0)

  const totalMoneyOut = myTransactions
    .filter((transaction) => transaction.type === 'debit')
    .reduce((total, transaction) => total + transaction.amountPaise, 0)

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          {t.yourAccount}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          {t.historyPageTitle}
        </h2>
        <p className="mt-2 text-slate-600">
          {t.historyPageDescription}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            {t.totalMoneyReceived}
          </p>
          <p className="mt-2 break-words text-2xl font-bold text-green-800">
            {formatMoney(totalMoneyIn)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {t.acrossDemoTransactions}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            {t.totalMoneySent}
          </p>
          <p className="mt-2 break-words text-2xl font-bold text-slate-900">
            {formatMoney(totalMoneyOut)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {t.acrossDemoTransactions}
          </p>
        </article>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-lg font-bold">{t.findTransaction}</h3>

        <label
          htmlFor="history-search"
          className="mt-4 block font-semibold"
        >
          {t.searchHistoryLabel}
        </label>
        <input
          id="history-search"
          type="search"
          value={historySearch}
          onChange={(event) => setHistorySearch(event.target.value)}
          placeholder={t.searchHistoryPlaceholder}
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        />

        <label
          htmlFor="history-type"
          className="mt-4 block font-semibold"
        >
          {t.transactionType}
        </label>
        <select
          id="history-type"
          value={historyType}
          onChange={(event) => setHistoryType(event.target.value)}
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <option value="all">{t.allTransactions}</option>
          <option value="debit">{t.moneySent}</option>
          <option value="credit">{t.moneyReceived}</option>
        </select>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            {t.showingTransactions} {filteredTransactions.length} {t.ofTransactions} {myTransactions.length}{' '}
            {t.transactions}
          </p>
          <button
            type="button"
            onClick={() => {
              setHistorySearch('')
              setHistoryType('all')
            }}
            className="min-h-11 rounded-lg px-3 font-semibold text-teal-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-700"
          >
            {t.clearFilters}
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={downloadCsvStatement}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
      >
        <span aria-hidden="true">↓</span>
        {t.downloadCsvStatement}
      </button>

      <p className="text-sm text-slate-600">
        {t.csvStatementDescription}
      </p>

      <section>
        <h3 className="mb-3 text-lg font-bold">{t.yourTransactions}</h3>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filteredTransactions.map((transaction) => {
            const isCredit = transaction.type === 'credit'

            return (
              <article
                key={transaction.id}
                className="flex items-start gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:gap-4"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold ${
                    isCredit
                      ? 'bg-green-100 text-green-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {isCredit ? '↓' : '↑'}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="break-words font-semibold text-slate-900">
  {translateTransactionTitle(transaction.title, language)}
</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {transaction.date}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {isCredit ? t.moneyReceived : t.moneySent}
                  </p>

                  {transaction.note && (
                    <p className="mt-1 break-words text-sm text-slate-600">
                      {t.noteLabel}: {transaction.note}
                    </p>
                  )}

                  <p className="mt-2 text-sm text-slate-600">
                    {t.statusLabel}:{' '}
  {language === 'hi' && transaction.status === 'Completed'
    ? t.completed
    : transaction.status || t.completed}
                  </p>
                </div>

                <div className="max-w-[45%] shrink-0 text-right">
                  <p
                    className={`break-words font-bold ${
                      isCredit ? 'text-green-800' : 'text-slate-900'
                    }`}
                  >
                    {isCredit ? '+' : '−'}
                    {formatMoney(transaction.amountPaise)}
                  </p>
                </div>
              </article>
            )
          })}

          {filteredTransactions.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="font-semibold text-slate-800">
                {t.noMatchingTransactions}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {t.tryAnotherSearch}
              </p>
              <button
                type="button"
                onClick={() => {
                  setHistorySearch('')
                  setHistoryType('all')
                }}
                className="mt-4 min-h-12 rounded-xl border border-slate-300 px-4 font-semibold text-slate-800"
              >
                {t.showAllTransactions}
              </button>
            </div>
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={() => setActiveTab('Home')}
        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700"
      >
        {t.backToHome}
      </button>
    </section>
  )
}

  function renderPlaceholder() {
    
const content = {
  History: {
    title: t.transactionHistory,
    description: t.demoTransactionsDescription,
    detail: t.historyDetail,
  },
  Services: {
    title: t.bankingServices,
    description: t.bankingServicesDescription,
    detail: t.servicesDetail,
  },
  Help: {
    title: t.helpTitle,
    description: t.helpDescription,
    detail: t.helpDetail,
  },
}

    const page = content[activeTab]
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">{page.title}</h2>
        <p className="mt-2 text-slate-700">{page.description}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{page.detail}</p>
        <button type="button" onClick={() => setActiveTab('Home')} className="mt-6 min-h-12 rounded-xl bg-teal-700 px-5 font-semibold text-white">{t.backToHome}</button>
      </section>
    )
  }

  if (!signedIn) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-lg">
          <header className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-2xl font-bold text-white">S</div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Saral Banking</h1>
            <p className="mt-2 text-base text-slate-600">Simple banking. Clear choices. Greater confidence.</p>
            <p className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">Hackathon demo · No real banking</p>
          </header>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold">Who is using Saral today?</h2>
            <p className="mt-2 text-base text-slate-600">Choose a fictional demo profile.</p>
            <div className="mt-5 space-y-3">
              {customers.map((customer) => {
                const selected = selectedCustomer.id === customer.id
                return (
                  <button key={customer.id} type="button" onClick={() => selectCustomer(customer)} aria-pressed={selected} className={`flex min-h-20 w-full items-center gap-3 rounded-xl border p-3 text-left ${selected ? 'border-teal-700 bg-teal-50 ring-1 ring-teal-700' : 'border-slate-200 hover:border-teal-400'}`}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-800">{customer.initials}</span>
                    <span className="min-w-0 flex-1"><span className="block font-semibold">{customer.name}, {customer.age}</span><span className="mt-1 block text-sm text-slate-600">{customer.description}</span></span>
                    <span aria-hidden="true">{selected ? '✓' : ''}</span>
                  </button>
                )
              })}
            </div>
            <form onSubmit={handleSignIn} className="mt-6">
              <label htmlFor="demo-pin" className="block font-semibold">Enter demo PIN</label>
              <input id="demo-pin" type="password" inputMode="numeric" autoComplete="off" maxLength={4} pattern="[0-9]{4}" value={pin} onChange={(event) => { setPin(event.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }} placeholder="Enter 4 digits" required className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-lg tracking-[0.4em]" />
              {error && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{error}</p>}
              <button type="submit" className="mt-5 min-h-12 w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800">Sign in to demo</button>
            </form>
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">Demo PIN: <strong>1234</strong>. Never enter your real banking credentials in a demo app.</p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 ${simpleMode ? 'text-lg' : ''}`}>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-xl font-bold text-white">S</div>
            <div className="min-w-0"><p className="font-bold">Saral Banking</p><p className="truncate text-sm text-slate-600">Hello, {selectedCustomer.name}</p></div>
          </div>
          <button type="button" onClick={signOut} className="min-h-11 shrink-0 rounded-lg border border-slate-300 px-3 text-sm font-semibold hover:bg-slate-50">Sign out</button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
        {activeTab === 'Home' && renderHome()}
        {activeTab === 'Pay' && renderPayment()}
        {activeTab === 'History' && renderHistory()}

        {['Services', 'Help'].includes(activeTab) && renderPlaceholder()}
      </main>

      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-3xl grid-cols-5">
          {navigation.map((item) => {
            const active = activeTab === item.id
            return (
              <button key={item.id} type="button" onClick={() => item.id === 'Pay' ? openPay() : setActiveTab(item.id)} aria-current={active ? 'page' : undefined} className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-teal-700 sm:text-sm ${active ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span aria-hidden="true" className="text-xl leading-6">{item.icon}</span>
                <span>{t[item.label]}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default App
