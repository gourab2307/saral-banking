
import { useEffect, useState } from 'react'
import { customers } from './data/customers.js'
import { paymentConfig } from './data/config.js'

// const customers = [
//   { id: 'shankar', name: 'Shankar', age: 68, description: 'Simple banking experience', initials: 'S', mode: 'simple', balancePaise: 2456800 },
//   { id: 'priya', name: 'Priya', age: 32, description: 'Everyday banking', initials: 'P', mode: 'standard', balancePaise: 8245500 },
//   { id: 'aarav', name: 'Aarav', age: 15, description: 'Young saver account', initials: 'A', mode: 'young', balancePaise: 1250000 },
// ]

const initialPayees = [
  { id: 'r1', name: 'Ananya Sharma', account: '•••• 1024', isNew: false },
  { id: 'r2', name: 'Rahul Verma', account: '•••• 5631', isNew: false },
  { id: 'r3', name: 'Meena Devi', account: '•••• 8842', isNew: false },
]

const initialTransactions = [
  { id: 't1', customerId: 'shankar', title: 'Grocery store', date: 'Today, 10:30 AM', amountPaise: 85000, type: 'debit', status: 'Completed' },
  { id: 't2', customerId: 'shankar', title: 'Money received', date: 'Yesterday, 4:15 PM', amountPaise: 250000, type: 'credit', status: 'Completed' },
  { id: 't3', customerId: 'shankar', title: 'Electricity bill', date: '20 Oct 2026', amountPaise: 132500, type: 'debit', status: 'Completed' },
  { id: 't4', customerId: 'priya', title: 'Salary credited', date: 'Today, 9:00 AM', amountPaise: 4500000, type: 'credit', status: 'Completed' },
  { id: 't5', customerId: 'aarav', title: 'Pocket money', date: 'Yesterday, 8:00 AM', amountPaise: 500000, type: 'credit', status: 'Completed' },
]

const navigation = [
  { id: 'Home', icon: '⌂' },
  { id: 'Pay', icon: '↗' },
  { id: 'History', icon: '↻' },
  { id: 'Services', icon: '▦' },
  { id: 'Help', icon: '?' },
]

const formatMoney = (paise) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(paise / 100)


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
  loadDemoData('saral-transactions-v1', initialTransactions)
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
      setPaymentError('Your demo balance is too low for this payment.')
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
        'Stop and verify the payment independently before continuing.'
      )
      return
    }

    if (!safetyAcknowledged) {
      setPaymentError(
        'Please confirm that you checked the recipient and amount.'
      )
      return
    }

    if (!isValidAmount) {
      setPaymentError(
        'Enter a valid payment amount within the demo limit.'
      )
      return
    }

if (recipientIsNew && amountPaise > paymentConfig.newPayeeLimitPaise) {
  setPaymentError('The demo limit for a new recipient is ₹10,000.')
  return
}

    if (paymentPin !== paymentConfig.demoPin) {
      setPaymentError('Incorrect demo PIN. Please try again.')
      return
    }

    const finalName = isNewPayee ? newRecipientName.trim() : selectedPayee?.name

    if (!finalName) {
      setPaymentError('Recipient details are missing. Start again.')
      return
    }

    if (amountPaise <= 0 || amountPaise > balances[selectedCustomer.id]) {
      setPaymentError('The payment amount is no longer valid. Start again.')
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
        <section className="rounded-2xl bg-teal-800 p-5 text-white shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-teal-100">AVAILABLE BALANCE · DEMO</p>
              <p className="mt-2 text-3xl font-bold sm:text-4xl">
                {balanceVisible ? formatMoney(balancePaise) : '₹ ••••••'}
              </p>
              <p className="mt-3 text-sm text-teal-100">Demo account · •••• 4821</p>
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
          <h2 className="text-xl font-bold">What would you like to do?</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { label: 'Send money', icon: '↗', action: openPay },
              { label: 'View history', icon: '↻', action: () => setActiveTab('History') },
              { label: 'Bank services', icon: '▦', action: () => setActiveTab('Services') },
              { label: 'Get help', icon: '?', action: () => setActiveTab('Help') },
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
            <h2 className="text-xl font-bold">Recent transactions</h2>
            <button
              type="button"
              onClick={() => setActiveTab('History')}
              className="min-h-11 rounded-lg px-2 text-sm font-semibold text-teal-800 underline underline-offset-4"
            >
              View all
            </button>
          </div>
          <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-4">
            {myTransactions.slice(0, 4).map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-3 py-4">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg">
                  {transaction.type === 'credit' ? '↓' : '↑'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{transaction.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{transaction.date}</p>
                  {transaction.status && <p className="mt-1 text-xs text-slate-500">{transaction.status}</p>}
                </div>
                <p className={`whitespace-nowrap text-sm font-bold ${transaction.type === 'credit' ? 'text-green-700' : ''}`}>
                  {transaction.type === 'credit' ? '+' : '−'}{formatMoney(transaction.amountPaise)}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">All balances and transactions are fictional.</p>
          <button
  type="button"
  onClick={resetDemoData}
  className="mt-4 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-100"
>
  Reset demo data
</button>
        </section>

        {selectedCustomer.mode === 'young' && (
          <section className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <h2 className="font-bold text-amber-950">Young saver account</h2>
            <p className="mt-1 text-sm text-amber-900">Payments above ₹2,000 need simulated guardian approval.</p>
          </section>
        )}
      </>
    )
  }

  function renderPayment() {
    const steps = [
      { id: 'recipient', label: '1. Recipient' },
      { id: 'review', label: '2. Review' },
      { id: 'safety', label: '3. Safety' },
      { id: 'pin', label: '4. Confirm' },
      { id: 'receipt', label: '5. Receipt' },
    ]
    const currentIndex = steps.findIndex((step) => step.id === paymentStep)

    if (paymentStep === 'receipt' && receipt) {
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-3xl text-teal-800">
            {guardianPending ? '⌛' : '✓'}
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold">
            {guardianPending ? 'Approval needed' : 'Demo payment complete'}
          </h2>
          <p className="mt-2 text-center text-slate-600">
            {guardianPending
              ? 'This payment has not been sent. It is waiting for guardian approval in the demo.'
              : 'This is a simulated payment. No real money was transferred.'}
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Payment amount</p>
            <p className="mt-1 text-3xl font-bold">{formatMoney(receipt.amountPaise)}</p>
            <div className="mt-5 space-y-4">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Recipient</span>
                <span className="text-right font-semibold">{receipt.recipient}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Account</span>
                <span className="font-semibold">{receipt.account}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Reference</span>
                <span className="break-all text-right font-semibold">{receipt.id}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Status</span>
                <span className="text-right font-semibold">{receipt.status}</span>
              </div>
              {receipt.note && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Note</span>
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
            Back to Home
          </button>
          <button
            type="button"
            onClick={openPay}
            className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-semibold"
          >
            Make another demo payment
          </button>
        </section>
      )
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-2xl font-bold">Send money</h2>
        <p className="mt-2 text-sm text-slate-600">Demo only · No real transfer will take place.</p>

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
              <label htmlFor="recipient" className="block font-semibold">Who are you paying?</label>
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
                <option value="">Choose a recipient</option>
                {payees.map((payee) => (
                  <option key={payee.id} value={payee.id}>{payee.name} · {payee.account}</option>
                ))}
                <option value="new">Add a new demo recipient</option>
              </select>
            </div>

            {isNewPayee && (
              <div className="space-y-4 rounded-xl bg-slate-50 p-4">
                <div>
                  <label htmlFor="new-name" className="block font-semibold">Recipient's registered name</label>
                  <input
                    id="new-name"
                    value={newRecipientName}
                    onChange={(event) => setNewRecipientName(event.target.value)}
                    maxLength={60}
                    autoComplete="off"
                    placeholder="e.g. Kavita Das"
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-account" className="block font-semibold">Fictional demo account number</label>
                  <input
                    id="new-account"
                    value={newRecipientAccount}
                    onChange={(event) => setNewRecipientAccount(event.target.value.replace(/\D/g, '').slice(0, 18))}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="4 to 18 digits"
                    className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3"
                    required
                  />
                  <p className="mt-1 text-sm text-slate-500">Use fictional digits only. This does not check a real bank account.</p>
                </div>
                <p className="text-sm font-medium text-amber-900">Safety rule: new demo recipients have a maximum payment of ₹10,000.</p>
              </div>
            )}

            <div>
              <label htmlFor="amount" className="block font-semibold">Amount (₹)</label>
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
                placeholder="e.g. 500"
                required
                className="mt-2 min-h-14 w-full rounded-xl border border-slate-300 px-4 text-xl"
              />
              <p className="mt-1 text-sm text-slate-500">Available demo balance: {formatMoney(balancePaise)}</p>
            </div>

            <div>
              <label htmlFor="note" className="block font-semibold">Note (optional)</label>
              <input
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={80}
                placeholder="e.g. Shared lunch"
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3"
              />
            </div>

            {paymentError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{paymentError}</p>}

            <button type="submit" className="min-h-12 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800">
              Review payment
            </button>
          </form>
        )}

        {paymentStep === 'review' && (
          <div className="mt-6">
            <h3 className="text-lg font-bold">Check the details carefully</h3>
            <div className="mt-4 space-y-4 rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between gap-3"><span className="text-slate-500">Recipient name</span><span className="text-right font-semibold">{isNewPayee ? newRecipientName.trim() : selectedPayee?.name}</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Demo account</span><span className="text-right font-semibold">{isNewPayee ? `•••• ${newRecipientAccount.slice(-4)}` : selectedPayee?.account}</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Amount</span><span className="font-bold">{formatMoney(amountPaise)}</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Demo fee</span><span className="font-semibold">{formatMoney(0)}</span></div>
              {note.trim() && <div className="flex justify-between gap-3"><span className="text-slate-500">Note</span><span className="text-right">{note.trim()}</span></div>}
            </div>
            <p className="mt-4 text-sm text-slate-600">Check the name and amount. A displayed name is not proof that a real bank account belongs to that person.</p>
            <button type="button" onClick={continueToSafety} className="mt-5 min-h-12 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white">Continue to safety check</button>
            <button type="button" onClick={() => setPaymentStep('recipient')} className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-semibold">Go back and edit</button>
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
        Your safety comes first
      </p>
      <h3 className="mt-1 text-xl font-bold text-amber-950">
        Pause before you pay
      </h3>
      <p className="mt-2 leading-6 text-amber-950">
        Scammers may pretend to be bank staff, police officers or people you
        know. They may create urgency to make you act without checking.
      </p>
    </div>
  </div>

  <div className="mt-4 space-y-3 rounded-xl bg-white p-4 text-sm text-slate-800">
    <p><strong>Never share:</strong> your PIN, OTP or passwords.</p>
    <p><strong>Verify independently:</strong> contact the person using a number you already trust.</p>
    <p><strong>Remember:</strong> this demo never transfers real money.</p>
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
      <p className="font-bold text-teal-950">Saral Safety Coach</p>
      <p className="mt-1 text-sm leading-6 text-teal-900">
        Here are the checks to make before you continue.
      </p>
    </div>
  </div>

  <ul className="mt-4 space-y-3 text-sm text-slate-800">
    {(isNewPayee || Boolean(selectedPayee?.isNew)) && (
      <li className="flex items-start gap-2">
        <span aria-hidden="true">⚠️</span>
        <span>
          <strong>New recipient:</strong> verify their details using a trusted,
          independent source. The demo limit is ₹10,000.
        </span>
      </li>
    )}

    {amountPaise > paymentConfig.maxPaymentPaise && (
      <li className="flex items-start gap-2">
        <span aria-hidden="true">⚠️</span>
        <span>
          <strong>Higher-value payment:</strong> pause and double-check the
          amount and recipient before proceeding.
        </span>
      </li>
    )}

    {selectedCustomer.mode === 'young' && amountPaise > paymentConfig.youngAccountApprovalThresholdPaise && (
      <li className="flex items-start gap-2">
        <span aria-hidden="true">👪</span>
        <span>
          <strong>Guardian review:</strong> this payment will remain pending
          in the demo until guardian approval is simulated.
        </span>
      </li>
    )}

    <li className="flex items-start gap-2">
      <span aria-hidden="true">✓</span>
      <span>
        Never proceed because someone is pressuring you. If the request came
        from a call or message, verify it independently.
      </span>
    </li>
  </ul>
</div>

            <fieldset>
              <legend className="font-semibold">Did someone call or message you and ask you to send this money?</legend>
              <div className="mt-3 space-y-3">
                <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <input type="radio" name="urgent-request" value="yes" checked={urgentRequest === 'yes'} onChange={(event) => { setUrgentRequest(event.target.value); setPaymentError('') }} />
                  <span>Yes, someone asked me to send it.</span>
                </label>
                <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <input type="radio" name="urgent-request" value="no" checked={urgentRequest === 'no'} onChange={(event) => { setUrgentRequest(event.target.value); setPaymentError('') }} />
                  <span>No, I am choosing this payment myself.</span>
                </label>
              </div>
            </fieldset>

            {isNewPayee && (
              <div className="rounded-xl border border-amber-200 p-3 text-sm">
                <strong>New recipient:</strong> Please verify the recipient independently. Demo limit: ₹10,000.
              </div>
            )}
            {amountPaise > paymentConfig.maxPaymentPaise && (
              <div className="rounded-xl border border-amber-200 p-3 text-sm">
                <strong>Large payment:</strong> Check the amount carefully before continuing.
              </div>
            )}

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
              <input type="checkbox" checked={safetyAcknowledged} onChange={(event) => { setSafetyAcknowledged(event.target.checked); setPaymentError('') }} className="mt-1" />
              <span>I have checked the recipient and amount, and I understand this is a demo.</span>
            </label>

            {paymentError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{paymentError}</p>}
            <button type="button" onClick={continueToPin} className="min-h-12 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white">Continue to demo PIN</button>
            <button type="button" onClick={() => setPaymentStep('review')} className="min-h-12 w-full rounded-xl border border-slate-300 px-4 font-semibold">Back to review</button>
          </div>
        )}

        {paymentStep === 'pin' && (
          <form onSubmit={completePayment} className="mt-6">
            <h3 className="text-lg font-bold">Confirm your demo payment</h3>
            <p className="mt-2 text-slate-600">You are simulating a payment of <strong>{formatMoney(amountPaise)}</strong> to <strong>{isNewPayee ? newRecipientName.trim() : selectedPayee?.name}</strong>.</p>
            <label htmlFor="payment-pin" className="mt-5 block font-semibold">Enter demo PIN</label>
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
              placeholder="4-digit demo PIN"
              className="mt-2 min-h-14 w-full rounded-xl border border-slate-300 px-4 text-xl tracking-[0.4em]"
            />
            <p className="mt-2 text-sm text-slate-500">For this fictional demo only, use PIN 1234.</p>
            {paymentError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{paymentError}</p>}
            <button type="submit" className="mt-5 min-h-12 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white">Confirm demo payment</button>
            <button type="button" onClick={() => setPaymentStep('safety')} className="mt-3 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-semibold">Back to safety check</button>
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
          Your account
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Transaction history
        </h2>
        <p className="mt-2 text-slate-600">
          See where your money goes and when money comes in.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Total money received
          </p>
          <p className="mt-2 break-words text-2xl font-bold text-green-800">
            {formatMoney(totalMoneyIn)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Across all your demo transactions
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Total money sent or spent
          </p>
          <p className="mt-2 break-words text-2xl font-bold text-slate-900">
            {formatMoney(totalMoneyOut)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Across all your demo transactions
          </p>
        </article>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-lg font-bold">Find a transaction</h3>

        <label
          htmlFor="history-search"
          className="mt-4 block font-semibold"
        >
          Search by name, date or note
        </label>
        <input
          id="history-search"
          type="search"
          value={historySearch}
          onChange={(event) => setHistorySearch(event.target.value)}
          placeholder="e.g. grocery or electricity"
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        />

        <label
          htmlFor="history-type"
          className="mt-4 block font-semibold"
        >
          Transaction type
        </label>
        <select
          id="history-type"
          value={historyType}
          onChange={(event) => setHistoryType(event.target.value)}
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <option value="all">All transactions</option>
          <option value="debit">Money sent or spent</option>
          <option value="credit">Money received</option>
        </select>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            Showing {filteredTransactions.length} of {myTransactions.length}{' '}
            transactions
          </p>
          <button
            type="button"
            onClick={() => {
              setHistorySearch('')
              setHistoryType('all')
            }}
            className="min-h-11 rounded-lg px-3 font-semibold text-teal-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-700"
          >
            Clear filters
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={downloadCsvStatement}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
      >
        <span aria-hidden="true">↓</span>
        Download CSV statement
      </button>

      <p className="text-sm text-slate-600">
        The CSV contains all transactions for your selected demo account,
        not just the results currently shown by your filters.
      </p>

      <section>
        <h3 className="mb-3 text-lg font-bold">Your transactions</h3>

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
                    {transaction.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {transaction.date}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {isCredit ? 'Money received' : 'Money sent or spent'}
                  </p>

                  {transaction.note && (
                    <p className="mt-1 break-words text-sm text-slate-600">
                      Note: {transaction.note}
                    </p>
                  )}

                  <p className="mt-2 text-sm text-slate-600">
                    Status: {transaction.status || 'Completed'}
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
                No matching transactions
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Try another search or clear your filters to see all transactions.
              </p>
              <button
                type="button"
                onClick={() => {
                  setHistorySearch('')
                  setHistoryType('all')
                }}
                className="mt-4 min-h-12 rounded-xl border border-slate-300 px-4 font-semibold text-slate-800"
              >
                Show all transactions
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
        Back to Home
      </button>
    </section>
  )
}

  function renderPlaceholder() {
    const content = {
      History: { title: 'Transaction history', description: 'Your demo transactions will appear here.', detail: 'The History screen with search and filters is a supporting feature.' },
      Services: { title: 'Banking services', description: 'Manage everyday banking requests.', detail: 'Demo service requests will be added here.' },
      Help: { title: 'How can we help?', description: 'Get clear answers and learn how to stay safe.', detail: 'FAQs and scam guidance will be added here.' },
    }
    const page = content[activeTab]
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">{page.title}</h2>
        <p className="mt-2 text-slate-700">{page.description}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{page.detail}</p>
        <button type="button" onClick={() => setActiveTab('Home')} className="mt-6 min-h-12 rounded-xl bg-teal-700 px-5 font-semibold text-white">Back to Home</button>
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
                <span>{item.id}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default App
