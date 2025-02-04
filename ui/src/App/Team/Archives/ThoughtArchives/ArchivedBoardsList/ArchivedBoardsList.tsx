/*
 * Copyright (c) 2022 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useCallback, useEffect, useState } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { useRecoilValue } from 'recoil';

import NotFoundSection from '../../../../../Common/NotFoundSection/NotFoundSection';
import BoardService from '../../../../../Services/Api/BoardService';
import { TeamState } from '../../../../../State/TeamState';
import Board from '../../../../../Types/Board';

import ArchivedBoardTile from './ArchivedBoardTile/ArchivedBoardTile';

import './ArchivedBoardsList.scss';

enum SortState {
	DateDescending,
	DateAscending,
	CountDescending,
	CountAscending,
}

interface Props {
	onBoardSelection(board: Board): void;
}

function ArchivedBoardsList({ onBoardSelection }: Props): JSX.Element {
	const [boards, setBoards] = useState<Board[]>([]);
	const [sortState, setSortState] = useState<SortState>(
		SortState.DateDescending
	);
	const team = useRecoilValue(TeamState);

	const getSortFunction = useCallback((currentSortState) => {
		switch (currentSortState) {
			case SortState.CountAscending:
				return sortByCountAscending;
			case SortState.CountDescending:
				return sortByCountDescending;
			case SortState.DateAscending:
				return sortByDateAscending;
			default:
				return sortByDateDescending;
		}
	}, []);

	useEffect(() => {
		if (team.id) {
			BoardService.getBoards(team.id, 0).then((retrievedBoards) =>
				setBoards([...retrievedBoards].sort(sortByDateDescending))
			);
		}
	}, [team.id]);

	useEffect(() => {
		setBoards((currentBoards) => {
			return [...currentBoards].sort(getSortFunction(sortState));
		});
	}, [getSortFunction, sortState]);

	function sortByDateDescending(a: Board, b: Board) {
		return moment(b.dateCreated).valueOf() - moment(a.dateCreated).valueOf();
	}

	function sortByDateAscending(a: Board, b: Board) {
		return moment(a.dateCreated).valueOf() - moment(b.dateCreated).valueOf();
	}

	function sortByCountDescending(a: Board, b: Board) {
		return b.thoughts.length - a.thoughts.length;
	}

	function sortByCountAscending(a: Board, b: Board) {
		return a.thoughts.length - b.thoughts.length;
	}

	function handleCountSort() {
		setSortState(
			sortState === SortState.CountDescending
				? SortState.CountAscending
				: SortState.CountDescending
		);
	}

	function handleDateSort() {
		setSortState(
			sortState === SortState.DateDescending
				? SortState.DateAscending
				: SortState.DateDescending
		);
	}

	return (
		<div className="archived-boards-list">
			{boards.length ? (
				<>
					<h1 className="thoughts-archive-title">Thought Archives</h1>
					<div className="list-header">
						<button
							className={classnames('sort-button', {
								'selected-asc': sortState === SortState.CountAscending,
								'selected-desc': sortState === SortState.CountDescending,
							})}
							onClick={handleCountSort}
						>
							#
						</button>
						<button
							className={classnames('sort-button', {
								'selected-asc': sortState === SortState.DateAscending,
								'selected-desc': sortState === SortState.DateDescending,
							})}
							onClick={handleDateSort}
						>
							Date
						</button>
						<div className="spacer" />
					</div>
					<ol className="list">
						{boards.map(function (board: Board) {
							return (
								<ArchivedBoardTile
									key={board.teamId + board.dateCreated + board.id}
									board={board}
									onTileClicked={onBoardSelection}
								/>
							);
						})}
					</ol>
				</>
			) : (
				<NotFoundSection
					paragraph={
						<>
							Boards will appear when retros are ended with{' '}
							<span className="bold">thoughts</span>.
						</>
					}
				/>
			)}
		</div>
	);
}

export default ArchivedBoardsList;
