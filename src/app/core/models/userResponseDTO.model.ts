export interface Rol {
    idRole: number,
    rolName: string
}


export interface UserResponseDTO{
    userId: number,
    userName: string,
    email: string,
    roles: Rol[];
}