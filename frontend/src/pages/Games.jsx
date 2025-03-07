import { useState, useEffect } from "react";
import api from "../api";
import Game from "../components/Games"; 
import "../styles/Games.css";

function Games() {
    const [games, setGames] = useState([]);
    const [file, setFile] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null); // State for file input
    const [date, setDate] = useState("");
    const [opponent, setOpponent] = useState("");
    const [scoreHC, setScoreHC] = useState("");
    const [scoreOpp, setScoreOpp] = useState("");
    const [goals, setGoals] = useState("");
    const [penalties, setPenalties] = useState("");
    const [penaltiesDrawn, setPenaltiesDrawn] = useState("");
    const [penaltyTimeMin, setPenaltyTimeMin] = useState("");
    const [penaltyTimeSec, setPenaltyTimeSec] = useState("");
    const [faceoffs, setFaceoffs] = useState("");
    const [faceoffsWon, setFaceoffsWon] = useState("");
    const [faceoffWinPercentage, setFaceoffWinPercentage] = useState("");
    const [hits, setHits] = useState("");
    const [faceoffsDZ, setFaceoffsDZ] = useState("");
    const [faceoffsWonDZ, setFaceoffsWonDZ] = useState("");
    const [faceoffsWonDZPercentage, setFaceoffsWonDZPercentage] = useState("");
    const [faceoffsNZ, setFaceoffsNZ] = useState("");
    const [faceoffsWonNZ, setFaceoffsWonNZ] = useState("");
    const [faceoffsWonNZPercentage, setFaceoffsWonNZPercentage] = useState("");
    const [faceoffsOZ, setFaceoffsOZ] = useState("");
    const [faceoffsWonOZ, setFaceoffsWonOZ] = useState("");
    const [faceoffsWonOZPercentage, setFaceoffsWonOZPercentage] = useState("");
    const [blockedShots, setBlockedShots] = useState("");
    const [faceoffsLost, setFaceoffsLost] = useState("");
    const [scoringChances, setScoringChances] = useState("");
    const [corsiPercentage, setCorsiPercentage] = useState("");
    const [hitsAgainst, setHitsAgainst] = useState("");
    const [powerPlay, setPowerPlay] = useState("");
    const [successfulPowerPlay, setSuccessfulPowerPlay] = useState("");
    const [powerPlayMin, setPowerPlayMin] = useState("");
    const [powerPlaySec, setPowerPlaySec] = useState("");
    const [powerPlayPercentage, setPowerPlayPercentage] = useState("");
    const [shortHanded, setShortHanded] = useState("");
    const [penaltyKilling, setPenaltyKilling] = useState("");
    const [shortHandedMin, setShortHandedMin] = useState("");
    const [shortHandedSec, setShortHandedSec] = useState("");
    const [shortHandedPercentage, setShortHandedPercentage] = useState("");
    const [xGPerShot, setXGPerShot] = useState("");
    const [opponentsXGPerShot, setOpponentsXGPerShot] = useState("");
    const [netXG, setNetXG] = useState("");
    const [xGConversion, setXGConversion] = useState("");
    const [xG, setXG] = useState("");
    const [opponentXG, setOpponentXG] = useState("");
    const [xGPerGoal, setXGPerGoal] = useState("");
    const [shots, setShots] = useState("");
    const [shotsOnGoal, setShotsOnGoal] = useState("");
    const [shotsBlocking, setShotsBlocking] = useState("");
    const [missedShots, setMissedShots] = useState("");
    const [percentageShotsOnGoal, setPercentageShotsOnGoal] = useState("");
    const [slapshot, setSlapshot] = useState("");
    const [wristShot, setWristShot] = useState("");
    const [powerPlayShots, setPowerPlayShots] = useState("");
    const [shortHandedShots, setShortHandedShots] = useState("");
    const [shootoutsScored, setShootoutsScored] = useState("");
    const [offensivePlayMin, setOffensivePlayMin] = useState("");
    const [offensivePlaySec, setOffensivePlaySec] = useState("");
    const [defensivePlayMin, setDefensivePlayMin] = useState("");
    const [defensivePlaySec, setDefensivePlaySec] = useState("");
    const [ozPossessionMin, setOzPossessionMin] = useState("");
    const [ozPossessionSec, setOzPossessionSec] = useState("");
    const [nzPossessionMin, setNzPossessionMin] = useState("");
    const [nzPossessionSec, setNzPossessionSec] = useState("");
    const [dzPossessionMin, setDzPossessionMin] = useState("");
    const [dzPossessionSec, setDzPossessionSec] = useState("");
    const [puckBattles, setPuckBattles] = useState("");
    const [puckBattlesWon, setPuckBattlesWon] = useState("");
    const [puckBattlesWonPercentage, setPuckBattlesWonPercentage] = useState("");
    const [puckBattlesOZ, setPuckBattlesOZ] = useState("");
    const [puckBattlesNZ, setPuckBattlesNZ] = useState("");
    const [puckBattlesDZ, setPuckBattlesDZ] = useState("");
    const [dekes, setDekes] = useState("");
    const [dekesSuccessful, setDekesSuccessful] = useState("");
    const [dekesUnsuccessful, setDekesUnsuccessful] = useState("");
    const [dekesSuccessfulPercentage, setDekesSuccessfulPercentage] = useState("");
    const [passesTotal, setPassesTotal] = useState("");
    const [accuratePasses, setAccuratePasses] = useState("");
    const [accuratePassesPercentage, setAccuratePassesPercentage] = useState("");
    const [preShotPasses, setPreShotPasses] = useState("");
    const [dumpIns, setDumpIns] = useState("");
    const [dumpOuts, setDumpOuts] = useState("");
    const [passesToTheSlot, setPassesToTheSlot] = useState("");
    const [ozPlay, setOzPlay] = useState("");
    const [ozPlayWithShots, setOzPlayWithShots] = useState("");
    const [ozPlayWithShotsPercentage, setOzPlayWithShotsPercentage] = useState("");
    const [counterAttacks, setCounterAttacks] = useState("");
    const [counterAttackWithShots, setCounterAttackWithShots] = useState("");
    const [counterAttackWithShotsPercentage, setCounterAttackWithShotsPercentage] = useState("");
    const [takeaways, setTakeaways] = useState("");
    const [takeawaysInNZ, setTakeawaysInNZ] = useState("");
    const [takeawaysInDZ, setTakeawaysInDZ] = useState("");
    const [puckLosses, setPuckLosses] = useState("");
    const [puckLossesOZ, setPuckLossesOZ] = useState("");
    const [puckLossesNZ, setPuckLossesNZ] = useState("");
    const [puckLossesDZ, setPuckLossesDZ] = useState("");
    const [retrievals, setRetrievals] = useState("");
    const [powerPlayRetrievals, setPowerPlayRetrievals] = useState("");
    const [penaltyKillRetrievals, setPenaltyKillRetrievals] = useState("");
    const [evOzRetrievals, setEvOzRetrievals] = useState("");
    const [evDzRetrievals, setEvDzRetrievals] = useState("");
    const [takeawaysInOZ, setTakeawaysInOZ] = useState("");
    const [loosePuckRecovery, setLoosePuckRecovery] = useState("");
    const [opponentDumpInRetrievals, setOpponentDumpInRetrievals] = useState("");
    const [entries, setEntries] = useState("");
    const [entriesViaPass, setEntriesViaPass] = useState("");
    const [entriesViaDumpIn, setEntriesViaDumpIn] = useState("");
    const [entriesViaStickhandling, setEntriesViaStickhandling] = useState("");
    const [breakouts, setBreakouts] = useState("");
    const [breakoutsViaPass, setBreakoutsViaPass] = useState("");
    const [breakoutsViaDumpOut, setBreakoutsViaDumpOut] = useState("");
    const [breakoutsViaStickhandling, setBreakoutsViaStickhandling] = useState("");

    useEffect(() => {
        getGames();
    }, []);

    const getGames = () => {
        api
            .get("/hood_hockey_app/games/")
            .then((res) => res.data)
            .then((data) => {
                setGames(data);
                console.log(data);
            })
            .catch((err) => alert(err));
    };

    const deleteGame = (id) => {
        // id is undefined
        console.log(id);
        if (!id) {
            console.error("Game ID is undefined");
            return;
        }
        api
            .delete(`/hood_hockey_app/games/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Game deleted!");
                getGames();
            })
            .catch((error) => alert(error));
    };

    const createGame = (e) => {
        e.preventDefault();
        const gameData = {
            Date: date,
            Opponent: opponent,
            Score_HC: parseInt(scoreHC),
            Score_Opp: parseInt(scoreOpp),
            Goals: parseInt(goals),
            Penalties: parseInt(penalties),
            Penalties_Drawn: parseInt(penaltiesDrawn),
            Penalty_Time_Min: parseInt(penaltyTimeMin),
            Penalty_Time_Sec: parseInt(penaltyTimeSec),
            Faceoffs: parseInt(faceoffs),
            Faceoffs_Won: parseInt(faceoffsWon),
            Faceoff_Win_Percentage: parseInt(faceoffWinPercentage),
            Hits: parseInt(hits),
            Faceoffs_DZ: parseInt(faceoffsDZ),
            Faceoffs_Won_DZ: parseInt(faceoffsWonDZ),
            Faceoffs_Won_DZ_Percentage: parseInt(faceoffsWonDZPercentage),
            Faceoffs_NZ: parseInt(faceoffsNZ),
            Faceoffs_Won_NZ: parseInt(faceoffsWonNZ),
            Faceoffs_Won_NZ_Percentage: parseInt(faceoffsWonNZPercentage),
            Faceoffs_OZ: parseInt(faceoffsOZ),
            Faceoffs_Won_OZ: parseInt(faceoffsWonOZ),
            Faceoffs_Won_OZ_Percentage: parseInt(faceoffsWonOZPercentage),
            Blocked_Shots: parseInt(blockedShots),
            Faceoffs_Lost: parseInt(faceoffsLost),
            Scoring_Chances: parseInt(scoringChances),
            CORSI_Percentage: parseInt(corsiPercentage),
            Hits_Against: parseInt(hitsAgainst),
            Power_Play: parseInt(powerPlay),
            Successful_Power_Play: parseInt(successfulPowerPlay),
            Power_Play_Min: parseInt(powerPlayMin),
            Power_Play_Sec: parseInt(powerPlaySec),
            Power_Play_Percentage: parseFloat(powerPlayPercentage),
            Short_Handed: parseInt(shortHanded),
            Penalty_Killing: parseInt(penaltyKilling),
            Short_Handed_Min: parseInt(shortHandedMin),
            Short_Handed_Sec: parseInt(shortHandedSec),
            Short_Handed_Percentage: parseFloat(shortHandedPercentage),
            xG_Per_Shot: parseFloat(xGPerShot),
            Opponents_xG_Per_Shot: parseFloat(opponentsXGPerShot),
            Net_xG: parseFloat(netXG),
            xG_Converssion: parseFloat(xGConversion),
            xG: parseFloat(xG),
            Opponent_xG: parseFloat(opponentXG),
            xG_Per_Goal: parseFloat(xGPerGoal),
            Shots: parseInt(shots),
            Shots_On_Goal: parseInt(shotsOnGoal),
            Shots_Blocking: parseInt(shotsBlocking),
            Missed_Shots: parseInt(missedShots),
            Percentage_Shots_On_Goal: parseFloat(percentageShotsOnGoal),
            Slapshot: parseInt(slapshot),
            Wrist_Shot: parseInt(wristShot),
            Power_Play_Shots: parseInt(powerPlayShots),
            Short_Handed_Shots: parseInt(shortHandedShots),
            Shootouts_Scored: parseInt(shootoutsScored),
            Offensive_Play_Min: parseInt(offensivePlayMin),
            Offensive_Play_Sec: parseInt(offensivePlaySec),
            Defensive_Play_Min: parseInt(defensivePlayMin),
            Defensive_Play_Sec: parseInt(defensivePlaySec),
            OZ_Possession_Min: parseInt(ozPossessionMin),
            OZ_Possession_Sec: parseInt(ozPossessionSec),
            NZ_Possession_Min: parseInt(nzPossessionMin),
            NZ_Possession_Sec: parseInt(nzPossessionSec),
            DZ_Possession_Min: parseInt(dzPossessionMin),
            DZ_Possession_Sec: parseInt(dzPossessionSec),
            Puck_Battles: parseInt(puckBattles),
            Puck_Battles_Won: parseInt(puckBattlesWon),
            Puck_Battles_Won_Percentage: parseInt(puckBattlesWonPercentage),
            Puck_Battles_OZ: parseInt(puckBattlesOZ),
            Puck_Battles_NZ: parseInt(puckBattlesNZ),
            Puck_Battles_DZ: parseInt(puckBattlesDZ),
            Dekes: parseInt(dekes),
            Dekes_Successful: parseInt(dekesSuccessful),
            Dekes_Unsuccessful: parseInt(dekesUnsuccessful),
            Dekes_Successful_Percentage: parseFloat(dekesSuccessfulPercentage),
            Passes_Total: parseInt(passesTotal),
            Accurate_Passes: parseInt(accuratePasses),
            Accurate_Passes_Percentage: parseFloat(accuratePassesPercentage),
            Pre_Shot_Passes: parseInt(preShotPasses),
            Dump_Ins: parseInt(dumpIns),
            Dump_Outs: parseInt(dumpOuts),
            Passes_To_The_Slot: parseInt(passesToTheSlot),
            OZ_Play: parseInt(ozPlay),
            OZ_Play_With_Shots: parseInt(ozPlayWithShots),
            OZ_Play_With_Shots_Percentage: parseFloat(ozPlayWithShotsPercentage),
            Counter_Attacks: parseInt(counterAttacks),
            Counter_Attack_With_Shots: parseInt(counterAttackWithShots),
            Counter_Attack_With_Shots_Percentage: parseFloat(counterAttackWithShotsPercentage),
            Takeaways: parseInt(takeaways),
            Takeaways_In_NZ: parseInt(takeawaysInNZ),
            Takeaways_In_DZ: parseInt(takeawaysInDZ),
            Puck_Losses: parseInt(puckLosses),
            Puck_Losses_OZ: parseInt(puckLossesOZ),
            Puck_Losses_NZ: parseInt(puckLossesNZ),
            Puck_Losses_DZ: parseInt(puckLossesDZ),
            Retrievals: parseInt(retrievals),
            Power_Play_Retrievals: parseInt(powerPlayRetrievals),
            Penalty_Kill_Retrievals: parseInt(penaltyKillRetrievals),
            EV_OZ_Retrievals: parseInt(evOzRetrievals),
            EV_DZ_Retrievals: parseInt(evDzRetrievals),
            Takeaways_In_OZ: parseInt(takeawaysInOZ),
            Loose_Puck_Recovery: parseInt(loosePuckRecovery),
            Opponent_Dump_In_Retrievals: parseInt(opponentDumpInRetrievals),
            Entries: parseInt(entries),
            Entries_Via_Pass: parseInt(entriesViaPass),
            Entries_Via_Dump_In: parseInt(entriesViaDumpIn),
            Entries_Via_Stickhandling: parseInt(entriesViaStickhandling),
            Breakouts: parseInt(breakouts),
            Breakouts_Via_Pass: parseInt(breakoutsViaPass),
            Breakouts_Via_Dump_Out: parseInt(breakoutsViaDumpOut),
            Breakouts_Via_Stickhandling: parseInt(breakoutsViaStickhandling),
        };

        api.post("/hood_hockey_app/games/", gameData, {
            headers: { "Content-Type": "application/json" }
        })
            .then((res) => {
                if (res.status === 201) alert("Game added!");
                resetForm();
                getGames();
            })
            .catch((err) => alert(err));
    };

    const resetForm = () => {
        setDate("");
        setOpponent("");
        setScoreHC("");
        setScoreOpp("");
        setGoals("");
        setPenalties("");
        setPenaltiesDrawn("");
        setPenaltyTimeMin("");
        setPenaltyTimeSec("");
        setFaceoffs("");
        setFaceoffsWon("");
        setFaceoffWinPercentage("");
        setHits("");
        setFaceoffsDZ("");
        setFaceoffsWonDZ("");
        setFaceoffsWonDZPercentage("");
        setFaceoffsNZ("");
        setFaceoffsWonNZ("");
        setFaceoffsWonNZPercentage("");
        setFaceoffsOZ("");
        setFaceoffsWonOZ("");
        setFaceoffsWonOZPercentage("");
        setBlockedShots("");
        setFaceoffsLost("");
        setScoringChances("");
        setCorsiPercentage("");
        setHitsAgainst("");
        setPowerPlay("");
        setSuccessfulPowerPlay("");
        setPowerPlayMin("");
        setPowerPlaySec("");setPowerPlayPercentage("");
        setShortHanded("");
        setPenaltyKilling("");
        setShortHandedMin("");
        setShortHandedSec("");
        setShortHandedPercentage("");
        setXGPerShot("");
        setOpponentsXGPerShot("");
        setNetXG("");
        setXGConversion("");
        setXG("");
        setOpponentXG("");
        setXGPerGoal("");
        setShots("");
        setShotsOnGoal("");
        setShotsBlocking("");
        setMissedShots("");
        setPercentageShotsOnGoal("");
        setSlapshot("");
        setWristShot("");
        setPowerPlayShots("");
        setShortHandedShots("");
        setShootoutsScored("");
        setOffensivePlayMin("");
        setOffensivePlaySec("");
        setDefensivePlayMin("");
        setDefensivePlaySec("");
        setOzPossessionMin("");
        setOzPossessionSec("");
        setNzPossessionMin("");
        setNzPossessionSec("");
        setDzPossessionMin("");
        setDzPossessionSec("");
        setPuckBattles("");
        setPuckBattlesWon("");
        setPuckBattlesWonPercentage("");
        setPuckBattlesOZ("");
        setPuckBattlesNZ("");
        setPuckBattlesDZ("");
        setDekes("");
        setDekesSuccessful("");
        setDekesUnsuccessful("");
        setDekesSuccessfulPercentage("");
        setPassesTotal("");
        setAccuratePasses("");
        setAccuratePassesPercentage("");
        setPreShotPasses("");
        setDumpIns("");
        setDumpOuts("");
        setPassesToTheSlot("");
        setOzPlay("");
        setOzPlayWithShots("");
        setOzPlayWithShotsPercentage("");
        setCounterAttacks("");
        setCounterAttackWithShots("");
        setCounterAttackWithShotsPercentage("");
        setTakeaways("");
        setTakeawaysInNZ("");
        setTakeawaysInDZ("");
        setPuckLosses("");
        setPuckLossesOZ("");
        setPuckLossesNZ("");
        setPuckLossesDZ("");
        setRetrievals("");
        setPowerPlayRetrievals("");
        setPenaltyKillRetrievals("");
        setEvOzRetrievals("");
        setEvDzRetrievals("");
        setTakeawaysInOZ("");
        setLoosePuckRecovery("");
        setOpponentDumpInRetrievals("");
        setEntries("");
        setEntriesViaPass("");
        setEntriesViaDumpIn("");
        setEntriesViaStickhandling("");
        setBreakouts("");
        setBreakoutsViaPass("");
        setBreakoutsViaDumpOut("");
        setBreakoutsViaStickhandling("");
    };
        // -------------------------------
        // File upload consts
        // -------------------------------
        const handleFileChange = (event) => {
            setFile(event.target.files[0]);
        };

        const uploadFile = () => {
            if (!file) {
                alert("Please select a file first.");
                return;
            }
    
            const formData = new FormData();
            formData.append("file", file);
    
            api.post("hood_hockey_app/games-upload-file/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
                .then((response) => {
                    alert("File uploaded successfully!");
                    console.log(response.data);
                })
                .catch((error) => {
                    alert("File upload failed.");
                    console.error(error);
                });
        };
    

    return (
        <div>
            {/*
            <div>
            <h1>Games</h1>
                {games.map((game) => (
                    <Game game={game} onDelete={deleteGame} key={game.id} />
                ))}
            </div>
            */}
            <h1>Add Game</h1>
            <form onSubmit={createGame}>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date" />
                <input type="text" value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="Opponent" />
                <input type="number" value={scoreHC} onChange={(e) => setScoreHC(e.target.value)} placeholder="Home Score" />
                <input type="number" value={scoreOpp} onChange={(e) => setScoreOpp(e.target.value)} placeholder="Opponent Score" />
                <input type="number" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="Goals" />
                <input type="number" value={penalties} onChange={(e) => setPenalties(e.target.value)} placeholder="Penalties" />
                <input type="number" value={penaltiesDrawn} onChange={(e) => setPenaltiesDrawn(e.target.value)} placeholder="Penalties Drawn" />
                <input type="number" value={penaltyTimeMin} onChange={(e) => setPenaltyTimeMin(e.target.value)} placeholder="Penalty Time Min" />
                <input type="number" value={penaltyTimeSec} onChange={(e) => setPenaltyTimeSec(e.target.value)} placeholder="Penalty Time Sec" />
                <input type="number" value={faceoffs} onChange={(e) => setFaceoffs(e.target.value)} placeholder="Faceoffs" />
                <input type="number" value={faceoffsWon} onChange={(e) => setFaceoffsWon(e.target.value)} placeholder="Faceoffs Won" />
                <input type="number" value={faceoffWinPercentage} onChange={(e) => setFaceoffWinPercentage(e.target.value)} placeholder="Faceoff Win Percentage" />
                <input type="number" value={hits} onChange={(e) => setHits(e.target.value)} placeholder="Hits" />
                <input type="number" value={faceoffsDZ} onChange={(e) => setFaceoffsDZ(e.target.value)} placeholder="Faceoffs DZ" />
                <input type="number" value={faceoffsWonDZ} onChange={(e) => setFaceoffsWonDZ(e.target.value)} placeholder="Faceoffs Won DZ" />
                <input type="number" value={faceoffsWonDZPercentage} onChange={(e) => setFaceoffsWonDZPercentage(e.target.value)} placeholder="Faceoffs Won DZ Percentage" />
                <input type="number" value={faceoffsNZ} onChange={(e) => setFaceoffsNZ(e.target.value)} placeholder="Faceoffs NZ" />
                <input type="number" value={faceoffsWonNZ} onChange={(e) => setFaceoffsWonNZ(e.target.value)} placeholder="Faceoffs Won NZ" />
                <input type="number" value={faceoffsWonNZPercentage} onChange={(e) => setFaceoffsWonNZPercentage(e.target.value)} placeholder="Faceoffs Won NZ Percentage" />
                <input type="number" value={faceoffsOZ} onChange={(e) => setFaceoffsOZ(e.target.value)} placeholder="Faceoffs OZ" />
                <input type="number" value={faceoffsWonOZ} onChange={(e) => setFaceoffsWonOZ(e.target.value)} placeholder="Faceoffs Won OZ" />
                <input type="number" value={faceoffsWonOZPercentage} onChange={(e) => setFaceoffsWonOZPercentage(e.target.value)} placeholder="Faceoffs Won OZ Percentage" />
                <input type="number" value={blockedShots} onChange={(e) => setBlockedShots(e.target.value)} placeholder="Blocked Shots" />
                <input type="number" value={faceoffsLost} onChange={(e) => setFaceoffsLost(e.target.value)} placeholder="Faceoffs Lost" />
                <input type="number" value={scoringChances} onChange={(e) => setScoringChances(e.target.value)} placeholder="Scoring Chances" />
                <input type="number" value={corsiPercentage} onChange={(e) => setCorsiPercentage(e.target.value)} placeholder="CORSI Percentage" />
                <input type="number" value={hitsAgainst} onChange={(e) => setHitsAgainst(e.target.value)} placeholder="Hits Against" />
                <input type="number" value={powerPlay} onChange={(e) => setPowerPlay(e.target.value)} placeholder="Power Play" />
                <input type="number" value={successfulPowerPlay} onChange={(e) => setSuccessfulPowerPlay(e.target.value)} placeholder="Successful Power Play" />
                <input type="number" value={powerPlayMin} onChange={(e) => setPowerPlayMin(e.target.value)} placeholder="Power Play Min" />
                <input type="number" value={powerPlaySec} onChange={(e) => setPowerPlaySec(e.target.value)} placeholder="Power Play Sec" />
                <input type="number" value={powerPlayPercentage} onChange={(e) => setPowerPlayPercentage(e.target.value)} placeholder="Power Play Percentage" />
                <input type="number" value={shortHanded} onChange={(e) => setShortHanded(e.target.value)} placeholder="Short Handed" />
                <input type="number" value={penaltyKilling} onChange={(e) => setPenaltyKilling(e.target.value)} placeholder="Penalty Killing" />
                <input type="number" value={shortHandedMin} onChange={(e) => setShortHandedMin(e.target.value)} placeholder="Short Handed Min" />
                <input type="number" value={shortHandedSec} onChange={(e) => setShortHandedSec(e.target.value)} placeholder="Short Handed Sec" />
                <input type="number" value={shortHandedPercentage} onChange={(e) => setShortHandedPercentage(e.target.value)} placeholder="Short Handed Percentage" />
                <input type="number" value={xGPerShot} onChange={(e) => setXGPerShot(e.target.value)} placeholder="xG Per Shot" />
                <input type="number" value={opponentsXGPerShot} onChange={(e) => setOpponentsXGPerShot(e.target.value)} placeholder="Opponents xG Per Shot" />
                <input type="number" value={netXG} onChange={(e) => setNetXG(e.target.value)} placeholder="Net xG" />
                <input type="number" value={xGConversion} onChange={(e) => setXGConversion(e.target.value)} placeholder="xG Conversion" />
                <input type="number" value={xG} onChange={(e) => setXG(e.target.value)} placeholder="xG" />
                <input type="number" value={opponentXG} onChange={(e) => setOpponentXG(e.target.value)} placeholder="Opponent xG" />
                <input type="number" value={xGPerGoal} onChange={(e) => setXGPerGoal(e.target.value)} placeholder="xG Per Goal" />
                <input type="number" value={shots} onChange={(e) => setShots(e.target.value)} placeholder="Shots" />
                <input type="number" value={shotsOnGoal} onChange={(e) => setShotsOnGoal(e.target.value)} placeholder="Shots On Goal" />
                <input type="number" value={shotsBlocking} onChange={(e) => setShotsBlocking(e.target.value)} placeholder="Shots Blocking" />
                <input type="number" value={missedShots} onChange={(e) => setMissedShots(e.target.value)} placeholder="Missed Shots" />
                <input type="number" value={percentageShotsOnGoal} onChange={(e) => setPercentageShotsOnGoal(e.target.value)} placeholder="Percentage Shots On Goal" />
                <input type="number" value={slapshot} onChange={(e) => setSlapshot(e.target.value)} placeholder="Slapshot" />
                <input type="number" value={wristShot} onChange={(e) => setWristShot(e.target.value)} placeholder="Wrist Shot" />
                <input type="number" value={powerPlayShots} onChange={(e) => setPowerPlayShots(e.target.value)} placeholder="Power Play Shots" />
                <input type="number" value={shortHandedShots} onChange={(e) => setShortHandedShots(e.target.value)} placeholder="Short Handed Shots" />
                <input type="number" value={shootoutsScored} onChange={(e) => setShootoutsScored(e.target.value)} placeholder="Shootouts Scored" />
                <input type="number" value={offensivePlayMin} onChange={(e) => setOffensivePlayMin(e.target.value)} placeholder="Offensive Play Min" />
                <input type="number" value={offensivePlaySec} onChange={(e) => setOffensivePlaySec(e.target.value)} placeholder="Offensive Play Sec" />
                <input type="number" value={defensivePlayMin} onChange={(e) => setDefensivePlayMin(e.target.value)} placeholder="Defensive Play Min" />
                <input type="number" value={defensivePlaySec} onChange={(e) => setDefensivePlaySec(e.target.value)} placeholder="Defensive Play Sec" />
                <input type="number" value={ozPossessionMin} onChange={(e) => setOzPossessionMin(e.target.value)} placeholder="OZ Possession Min" />
                <input type="number" value={ozPossessionSec} onChange={(e) => setOzPossessionSec(e.target.value)} placeholder="OZ Possession Sec" />
                <input type="number" value={nzPossessionMin} onChange={(e) => setNzPossessionMin(e.target.value)} placeholder="NZ Possession Min" />
                <input type="number" value={nzPossessionSec} onChange={(e) => setNzPossessionSec(e.target.value)} placeholder="NZ Possession Sec" />
                <input type="number" value={dzPossessionMin} onChange={(e) => setDzPossessionMin(e.target.value)} placeholder="DZ Possession Min" />
                <input type="number" value={dzPossessionSec} onChange={(e) => setDzPossessionSec(e.target.value)} placeholder="DZ Possession Sec" />
                <input type="number" value={puckBattles} onChange={(e) => setPuckBattles(e.target.value)} placeholder="Puck Battles" />
                <input type="number" value={puckBattlesWon} onChange={(e) => setPuckBattlesWon(e.target.value)} placeholder="Puck Battles Won" />
                <input type="number" value={puckBattlesWonPercentage} onChange={(e) => setPuckBattlesWonPercentage(e.target.value)} placeholder="Puck Battles Won Percentage" />
                <input type="number" value={puckBattlesOZ} onChange={(e) => setPuckBattlesOZ(e.target.value)} placeholder="Puck Battles OZ" />
                <input type="number" value={puckBattlesNZ} onChange={(e) => setPuckBattlesNZ(e.target.value)} placeholder="Puck Battles NZ" />
                <input type="number" value={puckBattlesDZ} onChange={(e) => setPuckBattlesDZ(e.target.value)} placeholder="Puck Battles DZ" />
                <input type="number" value={dekes} onChange={(e) => setDekes(e.target.value)} placeholder="Dekes" />
                <input type="number" value={dekesSuccessful} onChange={(e) => setDekesSuccessful(e.target.value)} placeholder="Dekes Successful" />
                <input type="number" value={dekesUnsuccessful} onChange={(e) => setDekesUnsuccessful(e.target.value)} placeholder="Dekes Unsuccessful" />
                <input type="number" value={dekesSuccessfulPercentage} onChange={(e) => setDekesSuccessfulPercentage(e.target.value)} placeholder="Dekes Successful Percentage" />
                <input type="number" value={passesTotal} onChange={(e) => setPassesTotal(e.target.value)} placeholder="Passes Total" />
                <input type="number" value={accuratePasses} onChange={(e) => setAccuratePasses(e.target.value)} placeholder="Accurate Passes" />
                <input type="number" value={accuratePassesPercentage} onChange={(e) => setAccuratePassesPercentage(e.target.value)} placeholder="Accurate Passes Percentage" />
                <input type="number" value={preShotPasses} onChange={(e) => setPreShotPasses(e.target.value)} placeholder="Pre Shot Passes" />
                <input type="number" value={dumpIns} onChange={(e) => setDumpIns(e.target.value)} placeholder="Dump Ins" />
                <input type="number" value={dumpOuts} onChange={(e) => setDumpOuts(e.target.value)} placeholder="Dump Outs" />
                <input type="number" value={passesToTheSlot} onChange={(e) => setPassesToTheSlot(e.target.value)} placeholder="Passes To The Slot" />
                <input type="number" value={ozPlay} onChange={(e) => setOzPlay(e.target.value)} placeholder="OZ Play" />
                <input type="number" value={ozPlayWithShots} onChange={(e) => setOzPlayWithShots(e.target.value)} placeholder="OZ Play With Shots" />
                <input type="number" value={ozPlayWithShotsPercentage} onChange={(e) => setOzPlayWithShotsPercentage(e.target.value)} placeholder="OZ Play With Shots Percentage" />
                <input type="number" value={counterAttacks} onChange={(e) => setCounterAttacks(e.target.value)} placeholder="Counter Attacks" />
                <input type="number" value={counterAttackWithShots} onChange={(e) => setCounterAttackWithShots(e.target.value)} placeholder="Counter Attack With Shots" />
                <input type="number" value={counterAttackWithShotsPercentage} onChange={(e) => setCounterAttackWithShotsPercentage(e.target.value)} placeholder="Counter Attack With Shots Percentage" />
                <input type="number" value={takeaways} onChange={(e) => setTakeaways(e.target.value)} placeholder="Takeaways" />
                <input type="number" value={takeawaysInNZ} onChange={(e) => setTakeawaysInNZ(e.target.value)} placeholder="Takeaways In NZ" />
                <input type="number" value={takeawaysInDZ} onChange={(e) => setTakeawaysInDZ(e.target.value)} placeholder="Takeaways In DZ" />
                <input type="number" value={puckLosses} onChange={(e) => setPuckLosses(e.target.value)} placeholder="Puck Losses" />
                <input type="number" value={puckLossesOZ} onChange={(e) => setPuckLossesOZ(e.target.value)} placeholder="Puck Losses OZ" />
                <input type="number" value={puckLossesNZ} onChange={(e) => setPuckLossesNZ(e.target.value)} placeholder="Puck Losses NZ" />
                <input type="number" value={puckLossesDZ} onChange={(e) => setPuckLossesDZ(e.target.value)} placeholder="Puck Losses DZ" />
                <input type="number" value={retrievals} onChange={(e) => setRetrievals(e.target.value)} placeholder="Retrievals" />
                <input type="number" value={powerPlayRetrievals} onChange={(e) => setPowerPlayRetrievals(e.target.value)} placeholder="Power Play Retrievals" />
                <input type="number" value={penaltyKillRetrievals} onChange={(e) => setPenaltyKillRetrievals(e.target.value)} placeholder="Penalty Kill Retrievals" />
                <input type="number" value={evOzRetrievals} onChange={(e) => setEvOzRetrievals(e.target.value)} placeholder="EV OZ Retrievals" />
                <input type="number" value={evDzRetrievals} onChange={(e) => setEvDzRetrievals(e.target.value)} placeholder="EV DZ Retrievals" />
                <input type="number" value={takeawaysInOZ} onChange={(e) => setTakeawaysInOZ(e.target.value)} placeholder="Takeaways In OZ" />
                <input type="number" value={loosePuckRecovery} onChange={(e) => setLoosePuckRecovery(e.target.value)} placeholder="Loose Puck Recovery" />
                <input type="number" value={opponentDumpInRetrievals} onChange={(e) => setOpponentDumpInRetrievals(e.target.value)} placeholder="Opponent Dump In Retrievals" />
                <input type="number" value={entries} onChange={(e) => setEntries(e.target.value)} placeholder="Entries" />
                <input type="number" value={entriesViaPass} onChange={(e) => setEntriesViaPass(e.target.value)} placeholder="Entries Via Pass" />
                <input type="number" value={entriesViaDumpIn} onChange={(e) => setEntriesViaDumpIn(e.target.value)} placeholder="Entries Via Dump In" />
                <input type="number" value={entriesViaStickhandling} onChange={(e) => setEntriesViaStickhandling(e.target.value)} placeholder="Entries Via Stickhandling" />
                <input type="number" value={breakouts} onChange={(e) => setBreakouts(e.target.value)} placeholder="Breakouts" />
                <input type="number" value={breakoutsViaPass} onChange={(e) => setBreakoutsViaPass(e.target.value)} placeholder="Breakouts Via Pass" />
                <input type="number" value={breakoutsViaDumpOut} onChange={(e) => setBreakoutsViaDumpOut(e.target.value)} placeholder="Breakouts Via Dump Out" />
                <input type="number" value={breakoutsViaStickhandling} onChange={(e) => setBreakoutsViaStickhandling(e.target.value)} placeholder="Breakouts Via Stickhandling" />
                <button type="submit">Add Game</button>
                <br />
                <br />
                <br />
                {/* File Upload Section */}
                <label>
                    Enter a File (.xlsx):
                    <input type="file" accept=".xlsx" onChange={handleFileChange} />
                </label>
                <button type="button" onClick={uploadFile}>Upload File</button>
            </form>
        </div>
    );
};

export default Games;