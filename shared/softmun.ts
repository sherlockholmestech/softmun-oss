export const defaultMotions = [
	"Adjourn Debate",
	"Suspend Debate",
	"Unmoderated Caucus",
	"Moderated Caucus",
	"Introduce Draft Resolution",
	"Introduce Unfriendly Ammendment",
	"Table Draft Resolution",
	"Move into Direct Voting Procedure on Draft Resolutions",
	"Amend Speaking Time",
];

export interface SoftmunUser {
	$id: string;
	email: string;
	$createdAt: string;
	$updatedAt: string;
}

export interface SoftmunCommittee {
	$id: string;
	name: string;
	ownerId: string;
	motionTypes: string[];
	members: string[];
	motions: string[];
	gsl: string[];
	speakers: string[];
	floor: string | null;
	gslList: string[];
	gslFloor: string | null;
	modList: string[];
	modFloor: string | null;
	modTotalTime: number | null;
	modSpeakingTime: number | null;
	modTopic: string | null;
	unmodTotalTime: number | null;
	$createdAt: string;
	$updatedAt: string;
}

export interface SoftmunMember {
	$id: string;
	committeeId: string;
	ownerId: string;
	name: string;
	voteType: "Observer" | "Standard" | "Veto";
	present: boolean;
	voting: boolean;
	$createdAt: string;
	$updatedAt: string;
}

export interface SoftmunMotion {
	$id: string;
	committeeId: string;
	proposer: string;
	motionType: string;
	type: string;
	time: number;
	speakers: number;
	modTopic: string | null;
	unmodTotalTime: number | null;
	modSpeakingTime: number | null;
	modTotalTime: number | null;
	amendedSpeakingTime: number | null;
	resolutionName: string | null;
	$createdAt: string;
	$updatedAt: string;
}

export interface SoftmunSpeakingEvent {
	$id: string;
	committeeId: string;
	memberId: string;
	startTime: string;
	endTime: string | null;
	duration: number | null;
	$createdAt: string;
}

export interface DelegateStats {
	memberId: string;
	memberName: string;
	totalSpeakingTimeSeconds: number;
	speakingTurns: number;
	motionsProposed: number;
}

export interface CommitteeStatistics {
	committeeId: string;
	committeeName: string;
	delegates: DelegateStats[];
}
