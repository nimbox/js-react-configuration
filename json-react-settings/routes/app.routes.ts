import {Router} from 'express';
const router = Router();

router.get('/', (req,res) => {
    console.log('Main page')
    res.json('Main Page')
})

export default router;
