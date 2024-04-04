import conn from "../lib/db";


export default async (req : any, res: any) => {
  try {
    console.log("req", req.body)
    const query = 'SELECT * FROM User'
    const values = []
    const result = await conn.query(
      query,
      []
    );
    console.log("ttt", result);
  } catch (error) {
    console.log(error);
  }
};