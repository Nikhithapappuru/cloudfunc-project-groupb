import axios from 'axios'


const registry = axios.create({
  baseURL: 'http://localhost:4000'
})

export default registry