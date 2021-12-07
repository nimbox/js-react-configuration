const message: Array<any> = ['Message from Backend!'];

module.exports = {
    Query: {
        message: ()=> message,
    },
    Mutation: {
        addTask: (parent, args, context) => {
            const newMessage = {
              id: message.length,
              text: args.name,
            };
      
            message.push(newMessage);
            return newMessage;
        }
    }
}