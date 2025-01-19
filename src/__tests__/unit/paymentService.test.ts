import { ServiceError } from '../../interfaces/errors';
import { getPaymentsService, createPaymentsService } from '../../services/paymentService';

describe('Payment Service', () => {
    it('should create a payment', async () => {
        const result: any | ServiceError = await createPaymentsService(
            { name: "test", amount: "10", grid: "<div>test</div>", code: "55" }
        );
        if ('error' in result) {
            fail("Failed to create payment");
        } else {
            expect(result?.code).toEqual("55");
        }
    });
    it('should have length on retrieving payments', async () => {
        const result: any | ServiceError = await getPaymentsService();
        if ('error' in result) {
            fail("Failed to retrieve payments");
        } else {
            expect(Object.values(result).length).toBeGreaterThanOrEqual(0);
        }
    });
});