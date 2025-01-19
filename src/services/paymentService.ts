

import { createFile, getFile, getServiceError, sanitizeHtml } from '../utils';
import { ServiceError } from '../interfaces/errors';
import path from 'path';

const PAYMENTS_FILE_PATH = path.join(__dirname, "../temp/payments.json");

type Payment = {
  name: string;
  amount: string;
  createdDate?: string;
  status?: "paid" | "return",
  grid: string;
  code: string;
  id?: string
}

export const getPaymentsHTMLService = async (): Promise<string | ServiceError> => {
  try {
    const result = await getFile(PAYMENTS_FILE_PATH);
    if (result === null) {
      return `<div style="color:#6a7a80;" class='empty-payment-wrapper'>
            <p class="emtpy-payment-message">No payment has been made at this moment.</p>
        </div>`;
    } else {
      const list: Array<Payment> = Object.values(result);
      return `<table style="width: 100%; table-layout: fixed; color: #6a7a80; border: 1px solid #6a7a80;" class="payments-table">
      <thead style="border-bottom: 1px solid #8a9da4;">
        <tr>
          <th style="width: 70%; text-align: left; padding: 15px; font-size: 14px; font-family: sans-serif;">NAME</th>
          <th style="width: 10%; text-align: center; padding: 15px; font-size: 14px; font-family: sans-serif;">AMOUNT</th>
          <th style="width: 10%; text-align: center; padding: 15px; font-size: 14px; font-family: sans-serif;">CODE</th>
          <th style="width: 10%; text-align: center; padding: 15px; font-size: 14px; font-family: sans-serif;">GRID</th>
        </tr>
      </thead>
      <tbody>
        ${list
          .map(
            (item: Payment) => `
          <tr>
            <td style="width: 70%; text-align: left; padding: 15px; font-size: 14px; font-family: sans-serif; border-top: 1px solid #8a9da4;">
              ${sanitizeHtml(item?.name)}
            </td>
            <td style="width: 10%; text-align: center; padding: 15px; font-size: 14px; font-family: sans-serif; border-top: 1px solid #8a9da4;">
              ${sanitizeHtml(item?.amount)}
            </td>
            <td style="width: 10%; text-align: center; padding: 15px; font-size: 14px; font-family: sans-serif; border-top: 1px solid #8a9da4;">
              ${sanitizeHtml(item?.code)}
            </td>
            <td style="width: 10%; text-align: center; padding: 15px; font-size: 14px; font-family: sans-serif; border-top: 1px solid #8a9da4;" 
                data-html="${sanitizeHtml(item?.grid?.replace(/"/g, "'"))}" id="grid-html">
              100
            </td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `
    }
  } catch (error) {
    return getServiceError(error);
  }
}
export const getPaymentsService = async () => {
  try {
    const result = await getFile(PAYMENTS_FILE_PATH);
    if (result === null) {
      return {};
    }
    else {
      return result;
    }
  } catch (error) {
    return getServiceError(error);
  }
}

export const createPaymentsService = async (payment: Payment) => {
  try {
    const paymentId: string = payment.code.toUpperCase() + "_" + new Date().getTime().toString() + "_PAYMENT";
    const payments = await getPaymentsService();
    const currentPayment = { ...payment, id: paymentId };

    const newPayments = { ...payments, [paymentId]: currentPayment }

    const result = await createFile(PAYMENTS_FILE_PATH, newPayments);
    if (result?.status == 'created') {
      return currentPayment;
    }
    throw new Error("Payment Failed");

  } catch (error) {
    return getServiceError(error);
  }
}
