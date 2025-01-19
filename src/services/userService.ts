

import { createFile, createTokenFile, deleteTokenFile, generateRandomTokenKey, getFile, getServiceError, getTokenFile, hashPassword } from '../utils';
import config from '../config';
import { ServiceError } from '../interfaces/errors';
import path from 'path';
import { error } from 'console';

const PAYMENTS_FILE_PATH = path.join(__dirname, "../temp/payments.json");

export const logoutUserService = async (id: string, token: string): Promise<{ status: boolean } | ServiceError | null> => {
  try {
    const document: any = {
      token: null
    }

    //Remove token from system
    await deleteTokenFile(token);

    //TODO: Close socket connection of user    

    return {
      status: true
    }

  } catch (error: any) {
    if (error.message === 'INVALID_ID') {
      return null;
    }
    return getServiceError(error);
  }
};

export const authUserService = async (email: string, securityAccess: string) => {
  try {

    const user: any = {}; //TODO: GET USER BY E-MAIL FROM MOCK DATA       

    if (!user || (user.securityAccess != hashPassword(securityAccess))) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (user.isEmailVerified != true) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    const token = {
      createdAt: new Date().getTime(),
      expiresAt: new Date().getTime() + (1000 * config.tokenExpirationTime),
      tokenId: generateRandomTokenKey(32),
      userId: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user?.isAdmin || false,
      lastLogin: new Date().getTime()
    }

    if (user?.token?.expiresAt > new Date().getTime()) {
      token.createdAt = user?.token?.createdAt;
      token.tokenId = user?.token?.tokenId;
    }

    await createTokenFile(token);

    return {
      document: user //TODO: Remove sensible data
    }

  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return null;
    }
    if (error.message === 'EMAIL_NOT_VERIFIED') {
      return -1;
    }
    return getServiceError(error);
  }

}

export const verifyUserTokenService = async (tokenId: string): Promise<boolean | ServiceError> => {
  try {
    const token = await getTokenFile(tokenId);
    if(token?.expiresAt < new Date().getTime()){
      return true; //USER_TOKEN_EXPIRED
    }else{
      return false; //USER_TOKEN_VALID
    }
  } catch (error) {
    return getServiceError(error);
  }
}


export const generateGridService = (bias?: string): { html: string, raw: string[] } | ServiceError => {
  try {
    const GRID_LAYOUT_SIZE = 10;
    const GRID_LAYOUT_TOTAL = GRID_LAYOUT_SIZE * GRID_LAYOUT_SIZE;

    // Generate a random letter, avoiding bias if provided
    const getRandomLetter = (): string => {
      let randomCode = Math.floor(Math.random() * 26) + 97; // 'a' to 'z'
      const biasCode = bias?.charCodeAt(0);

      while (bias && randomCode === biasCode) {
        randomCode = Math.floor(Math.random() * 26) + 97;
      }
      return String.fromCharCode(randomCode);
    };

    // Generate the initial grid of letters
    const letters = Array.from({ length: GRID_LAYOUT_TOTAL }, getRandomLetter);

    // Randomly replace letters with the bias letter (up to 20 times)
    if (bias) {
      const biasPositions = new Set<number>();
      const maxBiasCount = 20;

      while (biasPositions.size < maxBiasCount) {
        const position = Math.floor(Math.random() * GRID_LAYOUT_TOTAL);
        if (letters[position] !== bias) {
          biasPositions.add(position);
          letters[position] = bias;
        }
      }
    }

    // Generate the HTML grid
    const rows = [];
    for (let row = 0; row < GRID_LAYOUT_SIZE; row++) {
      const cells = [];
      for (let col = 0; col < GRID_LAYOUT_SIZE; col++) {
        const index = row * GRID_LAYOUT_SIZE + col;
        const isBias = letters[index] === bias;

        cells.push(`
          <span 
            style="
              padding: 30px 55px;
              display: inline-flex;
              justify-content: center;
              align-items: center;
              height: 20px;
              width: 20px;
              border-left: 1px solid #000;
              ${col === GRID_LAYOUT_SIZE - 1 ? 'border-right: 1px solid #000;' : ''}
              ${isBias ? 'background-color: blue;' : ''}
            "
            ${isBias ? 'data-bg="highlight"' : ''}
          >
            ${letters[index]}
          </span>
        `);
      }

      rows.push(`
        <div style="display: inline-flex; border-bottom: 1px solid #000; ${row === 0 ? 'border-top: 1px solid #000;' : ''}">
          ${cells.join('')}
        </div>
      `);
    }

    return {
      html: `${rows.join('')}`,
      raw: letters
    };
  } catch (error: any) {
    return getServiceError(error);
  }
};

type Payment = {
  name: string;
  amount: string;
  createdDate?: string;
  status?: "paid" | "return",
  grid: string;
  code: string;
  id?: string
}
const sanitizeHtml = (input: any): string => {
  if (!input) return "";
  return String(input)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/&/g, "&amp;");
};
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
