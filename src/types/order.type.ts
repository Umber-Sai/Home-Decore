import { DeliveryType } from "./delivery.type"
import { OrderStatusType } from "./order-status.type"
import { PaymentType } from "./payment.type"

export type OrderType = {

    deliveryType: DeliveryType,
    firstName: string,
    lastName: string,
    fatherName?: string,
    phone: string,
    paymentType: PaymentType,
    email: string,
    street?: string,
    house?: string,
    entrance?: string,
    apartment?: string,
    comment?: string,
    status?: OrderStatusType,
    deliveryCost?: number,
    totalAmount?: number,
    items?: {
        id: string,
        quantity: number,
        price: number,
        total: number,
        name?: string
    }[],

    statusRus?: string,
    color?: string

}