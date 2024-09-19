import axios from "axios";

export const LoginUser = async (email, password) => {
    var status = await fetchLogin(email, password) ?? "Что-то пошло не так."
    return status; 
}

export const SignUpUser = async (username, email, password) => {
    var status = await fetchSignUp(username, email, password) ?? "Что-то пошло не так."
    return status; 
}

export const fetchLogin = async (email, password) => {
    try{
        return await axios.post("https://localhost:52026/api/users/login", {email: email, password: password})
    }
    catch(e)
    {
        console.log(e);
    }
}

export const fetchSignUp = async (username, email, password) => {
    try{
        return await axios.post("https://localhost:52026/api/users/signup", {username: username, email: email, password: password})
    }
    catch(e)
    {
        console.log(e);
    }
}