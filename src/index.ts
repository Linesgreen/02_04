// noinspection AnonymousFunctionJS

import {runDb} from "./db/db";
import {app} from "./setting";
import 'dotenv/config'


export const port = process.env.PORT || 5000;

app.listen(port, async () => {
    console.log(`listen port ${port}`);
    await runDb()
});