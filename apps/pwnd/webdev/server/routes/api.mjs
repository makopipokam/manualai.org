import express from 'express';
import { requireUser, authenticate } from '../auth.mjs';
import { readPond, pondAction, trainTroops } from '../services/pond.mjs';
import { startAttempt, nextQuestion, answerQuestion, scanQuestion, completeAttempt, chooseUpgrade, quizStatus } from '../services/quiz.mjs';
import { currentOpponent, launchAttack, listReports, markReportsSeen, replayReport, leagueTable, progression } from '../services/strategy.mjs';
import { Economy as E } from '../shared.mjs';

const wrap = handler => (req, res, next) => Promise.resolve(handler(req, res)).then(body => {
  if (body !== undefined) res.json(body);
}).catch(next);

export function apiRouter() {
  const router = express.Router();
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

  router.get('/health', (_req, res) => res.json({ ok: true, service: 'pwnd', ruleset: E.RULESET_VERSION }));

  router.get('/me', wrap(async req => {
    const user = await authenticate(req);
    return { user: user ? { name: user.name || null, email: user.email || null } : null };
  }));

  router.use(requireUser);

  router.get('/state', wrap(async req => {
    const pond = await readPond(req.user.id);
    const [prog, quiz] = await Promise.all([progression(req.user), quizStatus(req.user)]);
    return { pond, progression: prog, quiz };
  }));
  router.get('/pond', wrap(req => readPond(req.user.id)));
  router.post('/pond/actions', wrap(req => pondAction(req.user.id, req.body)));
  router.post('/troops/train', wrap(req => trainTroops(req.user.id, req.body)));

  router.get('/quiz/status', wrap(req => quizStatus(req.user)));
  router.post('/quiz/attempts', wrap(req => startAttempt(req.user, req.body)));
  router.post('/quiz/attempts/:id/question', wrap(req => nextQuestion(req.user, req.params.id)));
  router.post('/quiz/attempts/:id/answer', wrap(req => answerQuestion(req.user, req.params.id, req.body)));
  router.post('/quiz/attempts/:id/scan', wrap(req => scanQuestion(req.user, req.params.id)));
  router.post('/quiz/attempts/:id/complete', wrap(req => completeAttempt(req.user, req.params.id)));
  router.post('/quiz/attempts/:id/upgrade', wrap(req => chooseUpgrade(req.user, req.params.id, req.body)));

  router.get('/progression', wrap(req => progression(req.user)));
  router.get('/matchmaking/opponent', wrap(req => currentOpponent(req.user)));
  router.post('/matchmaking/next', wrap(req => currentOpponent(req.user, { advance: true })));
  router.post('/attacks', wrap(req => launchAttack(req.user, req.body)));
  router.get('/reports', wrap(req => listReports(req.user, req.query.type)));
  router.post('/reports/seen', wrap(req => markReportsSeen(req.user)));
  router.get('/reports/:id/replay', wrap(req => replayReport(req.user, req.params.id)));
  router.get('/leagues/table', wrap(req => leagueTable(req.user)));

  return router;
}
