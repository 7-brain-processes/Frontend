import { Registration } from "../../types/Registration";
import { api } from "../api"

export const register = async (registrationForm: Registration): Promise<any> => {
    try {
        const response = await api.post('/api/v1/auth/register', registrationForm);
        return response.data;
    }
    catch (error: any) {
        if (error.response) {
            const { status, data } = error.response;
            throw new Error(`Ошибка регистрации (${status}): ${JSON.stringify(data)}`);
        }
        throw new Error(error.message);
    }
}