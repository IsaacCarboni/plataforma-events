export const generateUserErrorParam = (user) => {
    return `Uno o más atributos estuvieron incompletos o no fueron válidos.
Lista de propiedades requeridas:
* first_name : necesita ser String, recibió ${user.first_name}
* last_name  : necesita ser String, recibió ${user.last_name}
* email      : necesita ser String, recibió ${user.email}`;
};

export const generateEventErrorParam = (event) => {
    return `Propiedades faltantes para la creación del evento:
* title       : necesita ser String, recibió ${event?.title}
* description : necesita ser String, recibió ${event?.description}
* capacity    : necesita ser Number, recibió ${event?.capacity}`;
};