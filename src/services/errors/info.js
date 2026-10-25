export const generateUserErrorInfo = (user) => {
  return `Uno o más atributos estuvieron incompletos o no fueron válidos.
  Lista de propiedades requeridas:
  * first_name : necesita ser String, recibió ${user?.first_name}
  * last_name  : necesita ser String, recibió ${user?.last_name}
  * email      : necesita ser String, recibió ${user?.email}`;
};

export const generateEventErrorInfo = (event) => {
  return `Propiedades faltantes o inválidas para la creación del evento:
  * title       : necesita ser String, recibió ${event?.title}
  * description : necesita ser String, recibió ${event?.description}
  * capacity    : necesita ser Number, recibió ${event?.capacity}`;
};

export const generateProductErrorInfo = (product) => {
  return `Propiedades faltantes o inválidas para la creación del producto:
  * name       : necesita ser String, recibió ${product?.name}
  * category   : necesita ser String, recibió ${product?.category}
  * price      : necesita ser Number, recibió ${product?.price}
  * stock      : necesita ser Number, recibió ${product?.stock}`;
};

export const generateMockErrorInfo = (count) => {
  return `La cantidad de mocks solicitada no es válida o supera los límites permitidos.
  * count : necesita ser un número entero positivo mayor a 0, recibió ${count}`;
};