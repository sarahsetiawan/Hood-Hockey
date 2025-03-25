import React from "react";
import "../styles/Games.css"; // Keep your custom styles if needed
import { Card, ListGroup, Button } from 'react-bootstrap';

function Game({ game, onDelete }) {
    return (
        <Card className="mb-3">
            <Card.Body>
                <Card.Title>Game on {game.date}</Card.Title>
                <ListGroup variant="flush">
                    <ListGroup.Item>Opponent: {game.opponent}</ListGroup.Item>
                    <ListGroup.Item>Score (HC): {game.scoreHC}</ListGroup.Item>
                    <ListGroup.Item>Score (Opp): {game.scoreOpp}</ListGroup.Item>
                    {/* ... (List all game details in ListGroup.Item components) ... */}
                     <ListGroup.Item>xGPerShot: {game.xGPerShot}</ListGroup.Item>
                    <ListGroup.Item>Opponent xGPerShot: {game.opponentsXGPerShot}</ListGroup.Item>
                    <ListGroup.Item>Net xG: {game.netXG}</ListGroup.Item>
                    <ListGroup.Item>xG Conversion: {game.xGConversion}</ListGroup.Item>
                    <ListGroup.Item>xG: {game.xG}</ListGroup.Item>
                    <ListGroup.Item>Opponent xG: {game.opponentXG}</ListGroup.Item>
                    <ListGroup.Item>xG Per Goal: {game.xGPerGoal}</ListGroup.Item>
                    <ListGroup.Item>Shots: {game.shots}</ListGroup.Item>
                    <ListGroup.Item>Shots on Goal: {game.shotsOnGoal}</ListGroup.Item>
                    <ListGroup.Item>Shots Blocking: {game.shotsBlocking}</ListGroup.Item>
                    <ListGroup.Item>Missed Shots: {game.missedShots}</ListGroup.Item>
                    <ListGroup.Item>Percentage Shots on Goal: {game.percentageShotsOnGoal}</ListGroup.Item>
                    <ListGroup.Item>Slapshot: {game.slapshot}</ListGroup.Item>
                    <ListGroup.Item>Wrist Shot: {game.wristShot}</ListGroup.Item>
                    <ListGroup.Item>Power Play Shots: {game.powerPlayShots}</ListGroup.Item>
                    <ListGroup.Item>Short Handed Shots: {game.shortHandedShots}</ListGroup.Item>
                    <ListGroup.Item>Shootouts Scored: {game.shootoutsScored}</ListGroup.Item>
                    <ListGroup.Item>Offensive Play Min: {game.offensivePlayMin}</ListGroup.Item>
                    <ListGroup.Item>Offensive Play Sec: {game.offensivePlaySec}</ListGroup.Item>
                    <ListGroup.Item>Defensive Play Min: {game.defensivePlayMin}</ListGroup.Item>
                    <ListGroup.Item>Defensive Play Sec: {game.defensivePlaySec}</ListGroup.Item>
                    <ListGroup.Item>OZ Possession Min: {game.ozPossessionMin}</ListGroup.Item>
                    <ListGroup.Item>OZ Possession Sec: {game.ozPossessionSec}</ListGroup.Item>
                    <ListGroup.Item>NZ Possession Min: {game.nzPossessionMin}</ListGroup.Item>
                    <ListGroup.Item>NZ Possession Sec: {game.nzPossessionSec}</ListGroup.Item>
                    <ListGroup.Item>DZ Possession Min: {game.dzPossessionMin}</ListGroup.Item>
                    <ListGroup.Item>DZ Possession Sec: {game.dzPossessionSec}</ListGroup.Item>
                    <ListGroup.Item>Puck Battles: {game.puckBattles}</ListGroup.Item>
                    <ListGroup.Item>Puck Battles Won: {game.puckBattlesWon}</ListGroup.Item>
                    <ListGroup.Item>Puck Battles Won Percentage: {game.puckBattlesWonPercentage}</ListGroup.Item>
                    <ListGroup.Item>Puck Battles OZ: {game.puckBattlesOZ}</ListGroup.Item>
                    <ListGroup.Item>Puck Battles NZ: {game.puckBattlesNZ}</ListGroup.Item>
                    <ListGroup.Item>Puck Battles DZ: {game.puckBattlesDZ}</ListGroup.Item>
                    <ListGroup.Item>Dekes: {game.dekes}</ListGroup.Item>
                    <ListGroup.Item>Dekes Successful: {game.dekesSuccessful}</ListGroup.Item>
                    <ListGroup.Item>Dekes Unsuccessful: {game.dekesUnsuccessful}</ListGroup.Item>
                    <ListGroup.Item>Dekes Successful Percentage: {game.dekesSuccessfulPercentage}</ListGroup.Item>
                    <ListGroup.Item>Passes Total: {game.passesTotal}</ListGroup.Item>
                    <ListGroup.Item>Accurate Passes: {game.accuratePasses}</ListGroup.Item>
                    <ListGroup.Item>Accurate Passes Percentage: {game.accuratePassesPercentage}</ListGroup.Item>
                    <ListGroup.Item>Pre Shot Passes: {game.preShotPasses}</ListGroup.Item>
                    <ListGroup.Item>Dump Ins: {game.dumpIns}</ListGroup.Item>
                    <ListGroup.Item>Dump Outs: {game.dumpOuts}</ListGroup.Item>
                    <ListGroup.Item>Passes to the Slot: {game.passesToTheSlot}</ListGroup.Item>
                    <ListGroup.Item>OZ Play: {game.ozPlay}</ListGroup.Item>
                    <ListGroup.Item>OZ Play with Shots: {game.ozPlayWithShots}</ListGroup.Item>
                    <ListGroup.Item>OZ Play with Shots Percentage: {game.ozPlayWithShotsPercentage}</ListGroup.Item>
                    <ListGroup.Item>Counter Attacks: {game.counterAttacks}</ListGroup.Item>
                    <ListGroup.Item>Counter Attack with Shots: {game.counterAttackWithShots}</ListGroup.Item>
                    <ListGroup.Item>Counter Attack with Shots Percentage: {game.counterAttackWithShotsPercentage}</ListGroup.Item>
                    <ListGroup.Item>Takeaways: {game.takeaways}</ListGroup.Item>
                    <ListGroup.Item>Takeaways in NZ: {game.takeawaysInNZ}</ListGroup.Item>
                    <ListGroup.Item>Takeaways in DZ: {game.takeawaysInDZ}</ListGroup.Item>
                    <ListGroup.Item>Puck Losses: {game.puckLosses}</ListGroup.Item>
                    <ListGroup.Item>Puck Losses OZ: {game.puckLossesOZ}</ListGroup.Item>
                    <ListGroup.Item>Puck Losses NZ: {game.puckLossesNZ}</ListGroup.Item>
                    <ListGroup.Item>Puck Losses DZ: {game.puckLossesDZ}</ListGroup.Item>
                    <ListGroup.Item>Retrievals: {game.retrievals}</ListGroup.Item>
                    <ListGroup.Item>Power Play Retrievals: {game.powerPlayRetrievals}</ListGroup.Item>
                    <ListGroup.Item>Penalty Kill Retrievals: {game.penaltyKillRetrievals}</ListGroup.Item>
                    <ListGroup.Item>EV OZ Retrievals: {game.evOzRetrievals}</ListGroup.Item>
                    <ListGroup.Item>EV DZ Retrievals: {game.evDzRetrievals}</ListGroup.Item>
                    <ListGroup.Item>Takeaways in OZ: {game.takeawaysInOZ}</ListGroup.Item>
                    <ListGroup.Item>Loose Puck Recovery: {game.loosePuckRecovery}</ListGroup.Item>
                    <ListGroup.Item>Opponent Dump In Retrievals: {game.opponentDumpInRetrievals}</ListGroup.Item>
                    <ListGroup.Item>Entries: {game.entries}</ListGroup.Item>
                    <ListGroup.Item>Entries via Pass: {game.entriesViaPass}</ListGroup.Item>
                    <ListGroup.Item>Entries via Dump In: {game.entriesViaDumpIn}</ListGroup.Item>
                    <ListGroup.Item>Entries via Stickhandling: {game.entriesViaStickhandling}</ListGroup.Item>
                    <ListGroup.Item>Breakouts: {game.breakouts}</ListGroup.Item>
                    <ListGroup.Item>Breakouts via Pass: {game.breakoutsViaPass}</ListGroup.Item>
                    <ListGroup.Item>Breakouts via Dump Out: {game.breakoutsViaDumpOut}</ListGroup.Item>
                    <ListGroup.Item>Breakouts via Stickhandling: {game.breakoutsViaStickhandling}</ListGroup.Item>
                </ListGroup>
                <Button variant="danger" onClick={() => onDelete(game.id)} className="mt-3">
                    Delete Game
                </Button>
            </Card.Body>
        </Card>
    );
}

export default Game;