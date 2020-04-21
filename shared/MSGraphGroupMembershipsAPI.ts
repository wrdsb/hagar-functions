import { AxiosError, AxiosRequestConfig } from "axios";
import { DirectoryObject, Group } from "@microsoft/microsoft-graph-types";
import { msGraphAPI } from "./msGraphAPI";
import { apiConfig } from "./apiConfig";
import { ServerError } from "./serverError";
import { isContext } from "vm";

export class MSGraphGroupMembershipsAPI {
    private apiConfig: AxiosRequestConfig;
    private api: msGraphAPI;

    public constructor (apiToken: string ) {
        this.apiConfig = apiConfig;
        this.apiConfig.headers.common.Authorization = apiToken;
        this.api = new msGraphAPI(this.apiConfig);
    }

    // GET /groups/{id}/members
    public async list(id: string): Promise<DirectoryObject[] | ServerError> {
        try {
            const response = await this.api.get<DirectoryObject[]>(`/groups/${id}/members`);
            const data = response.data;
            return data;
        } catch (err) {
            if (err && err.response) {
                const axiosError = err as AxiosError<ServerError>
                return axiosError.response.data;
            }
            throw err;
        }
    }
    
    // GET /groups/{id}
    // public async get(id: string): Promise<Group | ServerError> {
        // try {
            // const response = await this.api.get<Group>(`/groups/${id}`);
            // const data = response.data;
            // return data;
        // } catch (err) {
            // if (err && err.response) {
                // const axiosError = err as AxiosError<ServerError>
                // return axiosError.response.data;
            // }
            // throw err;
        // }
    // }
    
    // POST /groups/{id}/members/$ref
    public async add(group: Group, directoryObject: DirectoryObject): Promise<boolean | ServerError> {
        try {
            const response = await this.api.post(`/groups/${group.id}/members/$ref`, JSON.stringify(directoryObject));
            return true;
        } catch (err) {
            if (err && err.response) {
                const axiosError = err as AxiosError<ServerError>
                return axiosError.response.data;
            }
            throw err;
        }
    }
    
    // DELETE /groups/{id}/members/{id}/$ref
    public async remove(group: Group, directoryObject: DirectoryObject): Promise<boolean | ServerError> {
        try {
            const response = await this.api.delete(`/groups/${group.id}/members/${directoryObject.id}/$ref`);
            return true;
        } catch (err) {
            if (err && err.response) {
                const axiosError = err as AxiosError<ServerError>
                return axiosError.response.data;
            }
            throw err;
        }
    }
}
