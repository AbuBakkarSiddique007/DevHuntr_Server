import { Response } from "express";

interface ResponseData<T> {
    httpStatusCode: number;
    success: boolean;
    message: string;
    data?: T;
}


const sendResponse = <T>(res: Response, responseData: ResponseData<T>) => {
    const { httpStatusCode, success, message, data } = responseData;

    res.status(httpStatusCode).json({
        success,
        message,
        data
    })
}


export default sendResponse;