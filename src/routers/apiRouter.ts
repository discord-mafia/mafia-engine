import { Router } from 'express';

export const router = Router();

router.all('*', (_, res) => {
	return res.status(404).send({
		error: 'Not found',
	});
});
