const { ApolloServer, gql, MockList } = require('apollo-server');
const rp = require('request-promise');

const API_URL = 'https://fr-cei-java-001.imfr.cgi.com/pp-order/api';

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
type Plate {
    description: String
    lastUpdate: String
    name: String
    plateCategoryId: String
    price: Float
}

type PlateCategory {
    lastUpdate: String
    name: String
    plates: [Plate]
}

type Query {
  plateCategories: [PlateCategory]
  plates: [Plate]
  plateCategory(name: String): PlateCategory
}

type TodayOrder {
    date: String
    id: String,
    ordered: Boolean,
    _userOrders: [UserOrder]
}

type UserOrder {
    username: String
    id: String
    email: String
    phone: String
    delivery: String
    plateOrders: [PlateOrder]
    comment: String
}

type PlateOrder {
    number: Int,
    _plate: Plate
}

input PlateInput {
    description: String
    lastUpdate: String
    name: String
    plateCategoryId: String
    price: Float
}

input PlateOrderInput {
    number: Int!
    _plate: PlateInput
}

input UserOrderInput {
    username: String!
    email: String!
    phone: String!
    delivery: String!
    plateOrders: [PlateOrderInput]
    comment: String
}

type Mutation {
  createOrder(input: UserOrderInput!) :  TodayOrder
}
`;

const resolvers = {
    Query: {
        plates: async (_source, args, ctx) => {
            const response = await rp(`${API_URL}/Plates`);
            return JSON.parse(response);
        },
        plateCategories: async (_source, args, ctx) =>  {
            const response = await rp(`${API_URL}/PlateCategories`);
            return JSON.parse(response);
        },
        plateCategory: async (_source, args, ctx) =>  {
            const response = await rp(`${API_URL}/PlateCategories/${args.name}`);
            return JSON.parse(response);
        }
    },
    PlateCategory: {
        plates : async (_source, args, ctx) => {
            const response = await rp(`${API_URL}/PlateCategories/${_source.name}/Plates`);
            return JSON.parse(response);
        }
    },
    Mutation: {
        createOrder: async (_source, args, ctx) => {
            const options = {
                url: `${API_URL}/Orders/userOrders`,
                method: 'POST',
                body: args.input,
                json:true
            };
            const response = await rp(options);
            return response;
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  });

