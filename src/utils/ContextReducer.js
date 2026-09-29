// Last edited by you@example.com @ 10/09/26 08:55.
import { act, createContext, useMemo, useReducer } from "react";

const reducer = (state, action) => {
  console.log("ACTION TYPE:", action.type);
  switch (action.type) {
    case "ADD":
      return [
        ...state,
        {
          id: action.id,
          tempId: action.tempId,
          name: action.name,
          price: action.price,
          qty: action.qty,
          size: action.priceOption,
          img: action.img,
        },
      ];
    case "UPDATE":
      let arr = [...state];
      return arr.map((food) => {
        if (food.tempId === action.tempId) {
          return {
            ...food,
            qty: action.qty,
            price: action.price,
          };
        }
        return food;
      });
    case "REMOVE":
      let newArr = [...state];
      newArr.splice(action.index, 1);
      return newArr;

    case "INCREMENT":
      let incArr = [...state];
      return incArr.map((food) => {
        if (food.tempId === action.tempId) {
          return {
            ...food,
            qty: food.qty + 1,
            price: food.price + action.unitPrice,
          };
        }
        return food;
      });

    case "DECREMENT":
      let decArr = [...state];
      return decArr.map((food) => {
        if (food.tempId === action.tempId) {
          return {
            ...food,
            qty: food.qty - 1,
            price: food.price - action.unitPrice,
          };
        }
        return food;
      });
    case "DROP":
      let dropArr = [];
      return dropArr;

    // arr.find((food, index)=>{
    //     if(food.tempId === action.tempId)
    //         arr[index]=
    //         {
    //             ...food,
    //             qty:parseInt(action.qty) + parseInt(food.qty),
    //             price:action.price + food.price}
    // })
    default:
      return state;
  }
};
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, []);
  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state, dispatch]);
  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
