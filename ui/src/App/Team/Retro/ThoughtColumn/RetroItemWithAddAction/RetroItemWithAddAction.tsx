/*
 * Copyright (c) 2021 Ford Motor Company
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
import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';

import AddActionItem from '../../../../../Common/AddActionItem/AddActionItem';
import Thought from '../../../../../Types/Thought';
import { ThoughtTopic } from '../../../../../Types/Topic';
import RetroItem from '../RetroItem/RetroItem';

import './RetroItemWithAddAction.scss';

interface RetroItemModalProps {
	type: ThoughtTopic;
	thought: Thought;
}

function RetroItemWithAddAction(props: RetroItemModalProps) {
	const { type, thought } = props;

	const [showAddActionItemCard, setShowAddActionItemCard] = useState(false);

	const addActionItemButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!showAddActionItemCard) addActionItemButtonRef.current?.focus();
	}, [showAddActionItemCard]);

	return (
		<div
			className={classnames('retro-item-with-add-action', {
				'creating-action': showAddActionItemCard,
			})}
		>
			<RetroItem
				thought={thought}
				disableButtons={showAddActionItemCard}
				type={type}
				disableAnimations
			/>
			{!showAddActionItemCard && (
				<button
					className="add-action-item-button"
					onClick={() => setShowAddActionItemCard(true)}
					ref={addActionItemButtonRef}
				>
					<i className="fas fa-plus plus-icon" aria-hidden />
					Add Action Item
				</button>
			)}
			{showAddActionItemCard && (
				<AddActionItem
					thought={thought}
					hideComponentCallback={() => setShowAddActionItemCard(false)}
				/>
			)}
		</div>
	);
}

export default RetroItemWithAddAction;
