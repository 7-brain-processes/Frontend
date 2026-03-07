import { Auth } from "../../types/Auth";
import { api } from "../api"

export const auth = async (authForm: Auth): Promise<any> => {
    try {
        const response = await api.post('/api/v1/auth/login', authForm);
        return response.data;
    }
    catch (error: any) {
        if (error.response) {
            const { status, data } = error.response;
            throw new Error(`Ошибка авторизации (${status}): ${JSON.stringify(data)}`);
        }
        throw new Error(error.message);
    }
}