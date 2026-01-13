export interface Payment {
  id: number
  saleId: number
  amount: number
  method: string
  paidAt: string
  transactionId: string
  notes?: string
}