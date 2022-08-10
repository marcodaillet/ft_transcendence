/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.tsx                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbonnet <mbonnet@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/08 15:50:20 by mbonnet           #+#    #+#             */
/*   Updated: 2022/08/10 18:04:11 by mbonnet          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import axios from "axios";
import { SyntheticEvent, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import { HeroContainer, HeroContent } from "../PlayGame";

type PongProps = {
    userId: number,
	type: number,
    gameId: number,
	invitationId: number,
	canvasX: number
}


export const Pong = () => {
	let location = useLocation();
    let data = location.state as PongProps;
	class Games {
		id = -1;
		ball_id = -1;
		canvasX = -1;
		canvasY = -1;
		blocksize = -1;
		raq1 = -1;
		raq2 = -1;
		dificult = -1;
		point1 = 0;
		point2 = 0;
		winner = -1;
	}
	
	class Raq {
		id = -1;
		user_id = -1;
		p_x = -1;
		p_y = -1;
		t_y = -1;
		connect = false;
	}
	
	class Ball {
		id = -1;
		p_x = -1;
		p_y = -1;
		m_x = 1;
		m_y = 1;
	}
	
	class User {
		constructor(id, name){
			this.id = id;
			this.name = name		
		}
		id = -1;
		name = "";
	}
	
	class Historique {
		constructor(){
			this.winner_id = myGame.winner;
			if (this.winner_id != myRaq1.user_id)
			{
				this.coter_winner = 2;
				this.looser_id = myRaq1.user_id;
				this.winner_point = myGame.point2;
				this.looser_point = myGame.point1;
			}
			else
			{
				this.coter_winner = 1;
				this.looser_id = myRaq2.user_id;
				this.winner_point = myGame.point1;
				this.looser_point = myGame.point2;
			}
			this.dificult = myGame.dificult;
		}
		coter_winner = -1;
		winner_id = -1;
		looser_id = -1;
		winner_point = -1;
		looser_point = -1;
		dificult = 1;  
	}
	let canvas;
	let ctx;
	let socket;
	let userId;
	let myGame = new Games();
	let myRaq1 = new Raq();
	let myRaq2 = new Raq();
	let myBall = new Ball;


	

	
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ mouv @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 

	function calY()
	{
		var tmp2 = myBall.m_y; 
		var tmp = myBall.m_x; 
		if ( tmp < 0)
			tmp *= -1;
		myBall.m_y = Math.round(tmp * Math.tan(30 * Math.PI / 100));
		if (tmp2 < 0 && myBall.m_y > 0)
			myBall.m_y *= -1;
		myBall.m_x *= -1;
	}
	function calX()
	{
		
		var tmp2 = myBall.m_x;
		var tmp = myBall.m_y;
		if ( tmp < 0)
			tmp *= -1;
		myBall.m_x = -1 * Math.round(tmp/Math.tan(30 * Math.PI / 100));
		if (tmp2 > 0 && myBall.m_x < 0)
			myBall.m_x *= -1;
		myBall.m_y *= -1;
	}
	function checkColision()
	{
		if ((myBall.p_y > myRaq1.p_y && myBall.p_y < myRaq1.p_y + myRaq1.t_y))
			if ((myBall.p_x > myRaq1.p_x && myBall.p_x < myRaq1.p_x + myGame.blocksize))
			{
				if ((myBall.m_x < 0 && myBall.p_x > myRaq1.p_x + myGame.blocksize/2) ||
					(myBall.m_x > 0 && myBall.p_x < myRaq1.p_x + myGame.blocksize/2))
					calY();
				return (1);	
			}
		if ((myBall.p_y > myRaq2.p_y && myBall.p_y < myRaq2.p_y + myRaq2.t_y))
			if ((myBall.p_x > myRaq2.p_x && myBall.p_x < myRaq2.p_x + myGame.blocksize))
			{
					if ((myBall.m_x > 0 && myBall.p_x < myRaq2.p_x + myGame.blocksize/2) ||
					(myBall.m_x < 0 && myBall.p_x > myRaq2.p_x + myGame.blocksize/2))
					calY();
				return (1);
			}
			return (0);
	}
	
	function mouvBall(socket)
	{
		if (myBall.id === -1)
		{
			return ;
		}
		if (checkColision() === 0)
		{
			if (myRaq1.user_id !== data.userId)
				return ;
			if (((myBall.p_x <= 0 && myBall.m_x < 0) || (myBall.p_x >= myGame.canvasX && myBall.m_x > 0)))
			{
				if (myBall.p_x <= 0 && myBall.m_x < 0)
					socket.emit('mouvPoint', {point1:myGame.point1, point2:myGame.point2 + 1});
				else if (myBall.p_x >= myGame.canvasX && myBall.m_x > 0)
					socket.emit('mouvPoint', {point1:myGame.point1 + 1, point2:myGame.point2});
				calY();
			}
			if ((myBall.p_y <= 0 && myBall.m_y < 0) || (myBall.p_y >= myGame.canvasY && myBall.m_y > 0))
				calX();
		}
		
		socket.emit('mouvBall', { newX:myBall.m_x + myBall.p_x, newY:myBall.m_y + myBall.p_y});
	}
	
	function mouvRaq(socket, nb)
	{
		if (data.userId == myRaq1.user_id && ((nb > 0 && myRaq1.p_y + myRaq1.t_y <= myGame.canvasY) || (nb < 0 && myRaq1.p_y >= 0)))
			socket.emit('mouvRaq', {witchRaq:1, p_y:nb});
		else if (data.userId == myRaq2.user_id && ((nb > 0 && myRaq2.p_y <= myGame.canvasY) || (nb < 0 && myRaq2.p_y >= 0)))
			socket.emit('mouvRaq', {witchRaq:2, p_y:nb});
	}

	document.onkeydown = function mouvRaquette(e)
	{
	 		if (e.keyCode == 39)//bas
	 			mouvRaq(socket, -5);
	 		else if (e.keyCode == 37)//haut
	 			mouvRaq(socket, +5);
	}

	function mouvs(socket)
	{
		mouvBall(socket);
	}
	
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ exeption @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 

	function beforeStartGame()
	{
		stade();
		ctx.fillStyle = "#000000";
		ctx.font = "40pt Calibri,Geneva,Arial";
		ctx.fillText("Waiting...", myGame.canvasX/2 - 100 ,  myGame.canvasY/2);
	}

	function MesEnd(socket, data)
	{
		var res = new Historique();	
		socket.emit('end', res);
		end(socket, data);
	}

	function checkEnd(socket)
	{	
		if (myGame.point1 === 5)
			socket.emit('mouvWinner', {winner:1});
		else if (myGame.point2 === 5)
			socket.emit('mouvWinner', {winner:2});
	}

	function end(socket, data)
	{
		let str;
		ctx.fillStyle = "#000000";
		if (data.userID === data.winner_id)
			str = "Winner !"
		else
			str = "looser"
		ctx.font = "15pt Calibri,Geneva,Arial";
		ctx.fillText(str, myGame.canvasX/2 - 35 ,  myGame.canvasY/2 - 30);
		ctx.font = "20pt Calibri,Geneva,Arial";
		if (data.coter_winner === 1)
			ctx.fillText(data.winner_point + " | " + data.looser_point , myGame.canvasX/2 - 30 ,  myGame.canvasY/2 + 30);
		else
			ctx.fillText(data.looser_point + " | " + data.winner_point , myGame.canvasX/2 - 30,  myGame.canvasY/2 + 30);
		socket.disconnect()
	}
	async function clean(){
		ctx.clearRect(0,0, myGame.canvasX, myGame.canvasY);
	}

	
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ draw @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 

	function ball()
	{	
		ctx.beginPath();
		ctx.arc(myBall.p_x, myBall.p_y, myGame.blocksize/2, 0, Math.PI*2, true);
		ctx.fill();
	}
	function raquette()
	{	
		ctx.fillRect(myRaq1.p_x, myRaq1.p_y,  myGame.blocksize, myRaq1.t_y);
		ctx.fillRect(myRaq2.p_x, myRaq2.p_y,  myGame.blocksize, myRaq2.t_y);	
	}
	function stade()
	{	
		ctx.fillStyle = "#000000";
		ctx.font = "20pt Calibri,Geneva,Arial";
		ctx.fillText(myGame.point1 + " | " + myGame.point2, 20 , 40);
		ctx.fillRect(myGame.canvasX/2, 0,  1, myGame.canvasY);	
	}
	function draws()
	{
		stade();
		ball();
		raquette();
	}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Update @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 


	function UpadateGame(id, ball_id, canvasX, canvasY
		, blocksize, dificult, raq1, raq2, winner, point1, point2)
	{
		myGame.id = id;
		myGame.ball_id = ball_id;
		myGame.canvasX = canvasX;
		myGame.canvasY = canvasY;
		myGame.blocksize = blocksize;
		myGame.raq1 = raq1;
		myGame.raq2 = raq2;
		myGame.dificult = dificult;
		myGame.point1 = point1;
		myGame.point2 = point2;
		myGame.winner = winner;
	}

	function UpadateRaq1(id,user_id,p_x, p_y, t_y, connect)
	{
		myRaq1.id = id;
		myRaq1.user_id = user_id;
		myRaq1.p_x = p_x;
		myRaq1.p_y = p_y;
		myRaq1.t_y = t_y;
		myRaq1.connect = connect;
	}

	function UpadateRaq2(id,user_id,p_x, p_y, t_y, connect)
	{
		myRaq2.id = id;
		myRaq2.user_id = user_id;
		myRaq2.p_x = p_x;
		myRaq2.p_y = p_y;
		myRaq2.t_y = t_y;
		myRaq2.connect = connect;
	}

	function UpadateBall(id, p_x, p_y)
	{
		myBall.id = id;
		myBall.p_x = p_x;
		myBall.p_y = p_y;
	}

	function update(data)
	{
		if (data.myGame)
		{
			UpadateGame(data.myGame.id, data.myGame.ball_id, data.myGame.canvasX, data.myGame.canvasY
				, data.myGame.blocksize, data.myGame.dificult, data.myGame.raq1, data.myGame.raq2
				, data.myGame.winner, data.myGame.point1, data.myGame.point2);
		}
		if (data.myRaq1)	
			UpadateRaq1(data.myRaq1.id, data.myRaq1.user_id, data.myRaq1.p_x, data.myRaq1.p_y, data.myRaq1.t_y, data.myRaq1.connect);
		if (data.myRaq2 )
			UpadateRaq2(data.myRaq2.id, data.myRaq2.user_id, data.myRaq2.p_x, data.myRaq2.p_y, data.myRaq2.t_y, data.myRaq2.connect);
		if (data.myBall)
		{
			UpadateBall(data.myBall.id, data.myBall.p_x, data.myBall.p_y);
		}	
		
	}

	
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@ processe d init du jeux @@@@@@@@@@@@@@@@@@@@@@@@@//
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// 
	
	function forEmitRunWithTimeout(){
		socket.emit('run', myGame)
	}
	
	function forEmitUpdateWithTimeout(){
		socket.emit('update', myGame)
	}
	
	function start(mydata)
	{
		clean();
		socket.emit('run', myGame)
		socket.on('run', async (data)=> {
			await clean();
			await draws();
			await mouvs(socket);
			await checkEnd(socket);
			await update(data);
			if (myGame.winner === -1)
				await setTimeout(forEmitRunWithTimeout, 1);
			else
				await MesEnd(socket, mydata);
		})
	}
	
	async function init(canvasX)
	{
	 	var parent;
	 	parent = document.getElementById('pong');
	 	canvas = document.createElement('canvas');
	 	canvas.width =  canvasX;
	 	canvas.height =	canvasX*0.6;
	 	canvas.style.border = "1px solid";
	 	ctx = canvas.getContext('2d');
	 	parent.appendChild(canvas);
	}
	
	async function socketConnect()
	{
		return (io('http://localhost:3000'));
	}

	async function takeUser(){
		return (await axios.get('user/getUserId'));
	}

	
	async function run(){
		await axios.get('game');
		socket = await socketConnect();
		socket.emit('Lancer de comunication', data);
	    socket.on('invitation', async (data) => {
			await axios.post('user/sendGameInvite', {userID: data.userID, gameID:data.gameID})
			await axios.post('user/sendUserInvite', {userID: data.userID, userInviteID:data.userInviteID})
		})
	    socket.on('initGame', async (data) => {
			await init(data.canvas);
		});
		socket.on('update', (data)=> {
		 	update(data);
		 	beforeStartGame();
		 	if (myGame.raq2 !== -1)
		  	{
		  		start(data);
		  		return ;
		  	}
		  	setTimeout(forEmitUpdateWithTimeout, 5);
		});
	}
	run();
	
	return (
			<div></div>
	);
}