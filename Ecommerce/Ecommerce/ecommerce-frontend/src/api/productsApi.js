import axios from "axios";

const PRODUCTS_API = "https://dummyjson.com/products";

export const fetchExternalProducts = async () => {

  const response = await axios.get(PRODUCTS_API);


  return response.data.products;

};