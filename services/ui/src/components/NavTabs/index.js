import React from 'react';
import Link from 'next/link';
import css from 'styled-jsx/css';
import EnvironmentLink from 'components/link/Environment';
import BackupsLink from 'components/link/Backups';
import DeploymentsLink from 'components/link/Deployments';
import TasksLink from 'components/link/Tasks';
import { bp, color } from 'lib/variables';

const { className: aClassName, styles: aStyles } = css.resolve`
  a {
    color: ${color.darkGrey};
    display: block;
    padding: 20px 20px 19px 60px;
    @media ${bp.wideUp} {
      padding-left: calc((100vw / 16) * 1);
    }
  }

  .active a {
    color: ${color.black};
  }
`;

const NavTabs = ({ activeTab, environment }) => (
  <ul className="navigation">
    <li
      className={`overview ${
        activeTab == 'overview' ? 'active' : ''
      } ${aClassName}`}
    >
      <EnvironmentLink
        environmentSlug={environment.openshiftProjectName}
        projectSlug={environment.project.name}
        className={aClassName}
      >
        Overview
      </EnvironmentLink>
    </li>
    <li
      className={`deployments ${
        activeTab == 'deployments' ? 'active' : ''
      } ${aClassName}`}
    >
      <DeploymentsLink
        environmentSlug={environment.openshiftProjectName}
        projectSlug={environment.project.name}
        className={aClassName}
      >
        Deployments
      </DeploymentsLink>
    </li>
    <li
      className={`backups ${
        activeTab == 'backups' ? 'active' : ''
      } ${aClassName}`}
    >
      <BackupsLink
        environmentSlug={environment.openshiftProjectName}
        projectSlug={environment.project.name}
        className={aClassName}
      >
        Backups
      </BackupsLink>
    </li>
    <li
      className={`tasks ${activeTab == 'tasks' ? 'active' : ''} ${aClassName}`}
    >
      <TasksLink
        environmentSlug={environment.openshiftProjectName}
        projectSlug={environment.project.name}
        className={aClassName}
      >
        Tasks
      </TasksLink>
    </li>
    <style jsx>{`
      .navigation {
        background: ${color.lightestGrey};
        border-right: 1px solid ${color.midGrey};
        margin: 0;
        z-index: 10;
        @media ${bp.tabletUp} {
          min-width: 30%;
          padding-bottom: 60px;
        }
        @media ${bp.wideUp} {
          min-width: 25%;
        }

        li {
          border-bottom: 1px solid ${color.midGrey};
          margin: 0;
          padding: 0;
          position: relative;

          &:hover {
            background-color: ${color.white};
          }

          &::before {
            background-color: ${color.linkBlue};
            background-position: center center;
            background-repeat: no-repeat;
            content: '';
            display: block;
            height: 59px;
            left: 0;
            position: absolute;
            top: 0;
            transition: all 0.3s ease-in-out;
            width: 45px;
          }

          a {
            color: ${color.darkGrey};
            display: block;
            padding: 20px 20px 19px 60px;
            @media ${bp.wideUp} {
              padding-left: calc((100vw / 16) * 1);
            }
          }

          &.active {
            &::before {
              background-color: ${color.almostWhite};
            }

            background-color: ${color.almostWhite};
            border-right: 1px solid ${color.almostWhite};
            width: calc(100% + 1px);

            a {
              color: ${color.black};
            }
          }

          &.overview {
            &::before {
              background-image: url('/static/images/overview.svg');
              background-size: 18px;
            }

            &.active::before {
              background-image: url('/static/images/overview-active.svg');
            }
          }

          &.deployments {
            &::before {
              background-image: url('/static/images/deployments.svg');
              background-size: 21px 16px;
            }

            &.active::before {
              background-image: url('/static/images/deployments-active.svg');
            }
          }

          &.backups {
            &::before {
              background-image: url('/static/images/backups.svg');
              background-size: 19px;
            }

            &.active::before {
              background-image: url('/static/images/backups-active.svg');
            }
          }

          &.tasks {
            &::before {
              background-image: url('/static/images/tasks.svg');
              background-size: 16px;
            }

            &.active::before {
              background-image: url('/static/images/tasks-active.svg');
            }
          }
        }
      }
    `}</style>
    {aStyles}
  </ul>
);

export default NavTabs;
