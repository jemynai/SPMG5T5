import { render, fireEvent } from '@testing-library/svelte';
import Apply from './Apply.svelte';

describe('Apply Component', () => {
    test('renders form correctly', () => {
        const { getByText, getByLabelText } = render(Apply);

        expect(getByText('Apply for WFH Arrangement')).toBeInTheDocument();
        expect(getByLabelText('Select WFH Date:')).toBeInTheDocument();
    });

    test('shows validation messages', async () => {
        const { getByText, getByRole } = render(Apply);
        const nextButton = getByRole('button', { name: 'Next' });

        await fireEvent.click(nextButton);

        expect(window.alert).toHaveBeenCalledWith('Please select a valid date at least 24 hours from now.');
    });

    test('submits data to backend', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Application submitted successfully!' }),
            })
        );

        const { getByText, getByRole, getByLabelText } = render(Apply);
        const dateInput = getByLabelText('Select WFH Date:');
        await fireEvent.input(dateInput, { target: { value: '2024-11-02' } });
        
        const submitButton = getByRole('button', { name: 'Submit' });
        await fireEvent.click(submitButton);

        expect(global.fetch).toHaveBeenCalledWith(
            'http://127.0.0.1:8080/submit_application',
            expect.objectContaining({ method: 'POST' })
        );
    });
});
