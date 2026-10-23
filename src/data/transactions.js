
const customersTransactions = [
  {
    customerId: 'shankar',
    bankCode: 'SBIN',
    names: ['RAMESH K', 'ANITA D', 'TRIPURA ELECTRICITY', 'LOCAL GROCERY', 'MEDICAL STORE', 'PENSION CREDIT'],
    descriptions: ['Grocery shopping', 'Money received', 'Electricity bill', 'Daily essentials', 'Pharmacy purchase', 'Pension credited'],
    amountsRupees: [850, 2500, 1325, 420, 650, 18000],
  },
  {
    customerId: 'priya',
    bankCode: 'HDFC',
    names: ['ACME SALARY', 'RAHUL V', 'SUPERMARKET', 'MOBILE BILL', 'ONLINE SHOP', 'ANANYA S'],
    descriptions: ['Salary credited', 'Money transferred', 'Supermarket purchase', 'Mobile bill', 'Online shopping', 'Money received'],
    amountsRupees: [45000, 1200, 2350, 599, 1800, 3200],
  },
  {
    customerId: 'aarav',
    bankCode: 'SBIN',
    names: ['MEENA D', 'SCHOOL CANTEEN', 'BOOK STORE', 'POCKET MONEY', 'SPORTS SHOP', 'FRIEND'],
    descriptions: ['Pocket money received', 'Canteen purchase', 'School books', 'Pocket money received', 'Sports supplies', 'Money received'],
    amountsRupees: [5000, 120, 450, 1500, 850, 200],
  },
]

function createCustomerTransactions(customer) {
  return Array.from({ length: 60 }, (_, index) => {
    const categoryIndex = index % customer.names.length
    const isCredit = index % 5 === 0
    const type = isCredit ? 'credit' : 'debit'

    // Spread records across August–October 2026.
    const dayOffset = Math.floor((index * 84) / 59)
    const dateObject = new Date(Date.UTC(2026, 7, 1 + dayOffset))
    const date = dateObject.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })

    const reference = String(
      412345678901 + customersTransactions.findIndex(
        (item) => item.customerId === customer.customerId
      ) * 1000 + index
    )

    const amountRupees = customer.amountsRupees[categoryIndex]
    const amountPaise = amountRupees * 100
    const bankName = customer.names[categoryIndex]

    return {
      id: `${customer.customerId}-tx-${String(index + 1).padStart(3, '0')}`,
      customerId: customer.customerId,
      title: customer.descriptions[categoryIndex],
      description: customer.descriptions[categoryIndex],
      rawDescription: `UPI/${isCredit ? 'CR' : 'DR'}/${reference}/${bankName}/${customer.bankCode}`,
      date,
      amountPaise,
      type,
      status: 'Completed',
    }
  })
}

export const initialTransactions = customersTransactions.flatMap(
  createCustomerTransactions
)
