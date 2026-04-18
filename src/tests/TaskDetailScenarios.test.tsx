import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useTaskDetailPage } from '../pages/TaskDetail/hooks/useTaskDetailPage';
import {
  postsService,
  teamFormationService,
  teamGradesService,
  teamInvitationsService,
  teamsService,
} from '../api/services';

jest.mock('../api/services', () => ({
  authService: {
    getCurrentUser: jest.fn(),
  },
  postsService: {
    listAvailableTeams: jest.fn(),
  },
  solutionsService: {
    listSolutionComments: jest.fn(),
  },
  teamFormationService: {
    runAutoTeamFormation: jest.fn(),
    getAutoFormationResult: jest.fn(),
    listAutoFormationStudents: jest.fn(),
    selectCaptains: jest.fn(),
    listCaptains: jest.fn(),
  },
  teamGradesService: {
    getMyTeamGrade: jest.fn(),
    getGradeVote: jest.fn(),
    submitGradeVote: jest.fn(),
  },
  teamInvitationsService: {
    getCaptainTeam: jest.fn(),
    listCaptainAvailableStudents: jest.fn(),
    sendCaptainInvitation: jest.fn(),
    listStudentInvitations: jest.fn(),
    respondToTeamInvitation: jest.fn(),
  },
  teamsService: {
    getMyTeam: jest.fn(),
    enrollInTeam: jest.fn(),
    leaveTeam: jest.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/course/course-1/task/task-1']}>
    <Routes>
      <Route path="/course/:courseId/task/:taskId" element={<>{children}</>} />
    </Routes>
  </MemoryRouter>
);

describe('TaskDetail scenarios tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (postsService.listAvailableTeams as jest.Mock).mockResolvedValue([]);
    (teamsService.getMyTeam as jest.Mock).mockRejectedValue(new Error('not in any team'));
    (teamGradesService.getMyTeamGrade as jest.Mock).mockResolvedValue(null);

    (teamFormationService.listAutoFormationStudents as jest.Mock).mockResolvedValue([]);
    (teamInvitationsService.listCaptainAvailableStudents as jest.Mock).mockResolvedValue([]);
    (teamInvitationsService.getCaptainTeam as jest.Mock).mockResolvedValue([]);
    (teamInvitationsService.listStudentInvitations as jest.Mock).mockResolvedValue([]);
  });

  test('7402: participant can submit grade vote distribution', async () => {
    (teamGradesService.getGradeVote as jest.Mock).mockResolvedValue({
      teamId: 'team-1',
      teamGrade: 100,
      finalized: false,
      voters: [],
      myVote: null,
      finalDistribution: null,
    });

    (teamGradesService.submitGradeVote as jest.Mock).mockResolvedValue({
      teamId: 'team-1',
      teamGrade: 100,
      finalized: false,
      voters: [],
      myVote: [
        { student: { id: 's1' }, grade: 60 },
        { student: { id: 's2' }, grade: 40 },
      ],
      finalDistribution: null,
    });

    const { result } = renderHook(() => useTaskDetailPage('STUDENT', true), { wrapper });

    await act(async () => {
      await result.current.functions.retryLoadGradeVote(
        [{ id: 's1' }, { id: 's2' }],
        { distributionMode: 'TEAM_VOTE' } as any
      );
    });

    act(() => {
      result.current.functions.handleGradeVoteFieldChange('s1', 60);
      result.current.functions.handleGradeVoteFieldChange('s2', 40);
    });

    await act(async () => {
      await result.current.functions.handleSubmitGradeVote();
    });

    expect(teamGradesService.submitGradeVote).toHaveBeenCalledWith('course-1', 'task-1', {
      grades: [
        { studentId: 's1', grade: 60 },
        { studentId: 's2', grade: 40 },
      ],
    });
    expect(result.current.state.gradeVoteSuccess).toBe('Голос успешно отправлен');
  });

  test('7305: captain flow loads team and sends invitation', async () => {
    (teamInvitationsService.getCaptainTeam as jest.Mock).mockResolvedValue([
      { userId: 'cap-1', username: 'captain', displayName: 'Captain' },
    ]);
    (teamInvitationsService.listCaptainAvailableStudents as jest.Mock).mockResolvedValue([
      { id: 'st-1', username: 'student1', displayName: 'Student 1' },
    ]);
    (teamInvitationsService.sendCaptainInvitation as jest.Mock).mockResolvedValue({
      id: 'inv-1',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      respondedAt: null,
      captain: { id: 'cap-1', username: 'captain', displayName: 'Captain', createdAt: new Date().toISOString() },
      student: { id: 'st-1', username: 'student1', displayName: 'Student 1', createdAt: new Date().toISOString() },
      team: { teamId: 'team-1', teamName: 'Team 1', currentMembers: 1, maxSize: 4 },
    });

    const { result } = renderHook(() => useTaskDetailPage('STUDENT', true), { wrapper });

    await act(async () => {
      await result.current.functions.retryLoadCaptainFlow();
    });

    expect(teamInvitationsService.getCaptainTeam).toHaveBeenCalledWith('course-1', 'task-1');
    expect(result.current.state.captainTeam.length).toBe(1);

    await act(async () => {
      await result.current.functions.handleSendCaptainInvitation('st-1');
    });

    expect(teamInvitationsService.sendCaptainInvitation).toHaveBeenCalledWith('course-1', 'task-1', { studentId: 'st-1' });
    expect(result.current.state.captainInviteSuccess).toBe('Приглашение отправлено');
  });

  test('7275: teacher can select captains and reshuffle', async () => {
    (teamFormationService.selectCaptains as jest.Mock).mockResolvedValue([
      { userId: 'cap-1', username: 'captain', displayName: 'Captain' },
    ]);

    const { result } = renderHook(() => useTaskDetailPage('TEACHER', true), { wrapper });

    await act(async () => {
      await result.current.functions.handleSelectCaptains(false);
    });

    expect(teamFormationService.selectCaptains).toHaveBeenCalledWith('course-1', 'task-1', { reshuffle: false });
    expect(result.current.state.captainsSuccess).toBe('Капитаны успешно выбраны');

    await act(async () => {
      await result.current.functions.handleSelectCaptains(true);
    });

    expect(teamFormationService.selectCaptains).toHaveBeenCalledWith('course-1', 'task-1', { reshuffle: true });
    expect(result.current.state.captainsSuccess).toBe('Список капитанов обновлен повторным запуском');
  });

  test('7247: student can enroll and leave team in FREE mode', async () => {
    (teamsService.enrollInTeam as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Successfully enrolled in team: Team A',
      team: { teamId: 'team-a', teamName: 'Team A', currentMembers: 2, maxSize: 4 },
    });
    (teamsService.leaveTeam as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Successfully left team: Team A',
      team: { teamId: 'team-a', teamName: 'Team A', currentMembers: 1, maxSize: 4 },
    });

    const { result } = renderHook(() => useTaskDetailPage('STUDENT', true), { wrapper });

    await act(async () => {
      await result.current.functions.handleEnrollInTeam('team-a');
    });

    expect(teamsService.enrollInTeam).toHaveBeenCalledWith('course-1', 'task-1', 'team-a');
    expect(result.current.state.teamActionSuccess).toContain('Вы успешно вступили в команду');

    await act(async () => {
      await result.current.functions.handleLeaveTeam('team-a');
    });

    expect(teamsService.leaveTeam).toHaveBeenCalledWith('course-1', 'task-1', 'team-a');
    expect(result.current.state.teamActionSuccess).toContain('Вы успешно вышли из команды');
  });

  test('7145: teacher can run automatic team formation', async () => {
    (teamFormationService.runAutoTeamFormation as jest.Mock).mockResolvedValue({
      formedTeams: 2,
      assignedStudents: 5,
      unassignedStudents: 1,
      generatedAt: new Date().toISOString(),
      teams: [],
    });
    (teamFormationService.listAutoFormationStudents as jest.Mock).mockResolvedValue([
      { id: 'st-1', username: 'student1', displayName: 'Student 1' },
    ]);

    const { result } = renderHook(() => useTaskDetailPage('TEACHER', true), { wrapper });

    await act(async () => {
      await result.current.functions.handleRunAutoFormation(false);
    });

    expect(teamFormationService.runAutoTeamFormation).toHaveBeenCalledWith('course-1', 'task-1', {
      minTeamSize: 2,
      maxTeamSize: 4,
      balanceByCategory: true,
      balanceByRole: false,
      reshuffle: false,
    });
    expect(result.current.state.autoFormationSuccess).toBe('Автоматическое формирование команд выполнено');
    expect(result.current.state.autoFormationStudents.length).toBe(1);
  });
});
