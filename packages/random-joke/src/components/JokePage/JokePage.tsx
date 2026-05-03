import React, { useState, useCallback } from 'react';
import { useAsync } from 'react-use';
import {
  useApi,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  Page,
  Header,
  Content,
  InfoCard,
  Progress,
  ErrorPanel,
} from '@backstage/core-components';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 600,
    margin: `${theme.spacing(4)}px auto`,
  },
  setup: {
    fontSize: '1.4rem',
    fontWeight: 500,
    lineHeight: 1.6,
    marginBottom: theme.spacing(2),
  },
  punchline: {
    fontSize: '1.25rem',
    fontStyle: 'italic',
    color: theme.palette.primary.main,
    fontWeight: 500,
    padding: theme.spacing(2, 0),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
  buttonProgress: {
    marginRight: theme.spacing(1),
  },
  refetchError: {
    marginBottom: theme.spacing(2),
  },
}));

interface Joke {
  type: string;
  setup: string;
  punchline: string;
  id: number;
}

const formatType = (type: string) =>
  type.charAt(0).toUpperCase() + type.slice(1);

export const JokePage = () => {
  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);
  const [currentJoke, setCurrentJoke] = useState<Joke | null>(null);

  const { loading, error } = useAsync(async () => {
    const proxyUrl = await discoveryApi.getBaseUrl('proxy');
    const response = await fetchApi.fetch(
      `${proxyUrl}/joke-api/random_joke`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch joke: ${response.statusText}`);
    }
    const data = (await response.json()) as Joke;
    setCurrentJoke(data);
    setShowPunchline(false);
  }, [refreshKey]);

  const isInitialLoad = loading && !currentJoke;
  const isRefetching = loading && !!currentJoke;

  const handleReveal = useCallback(() => setShowPunchline(true), []);
  const handleNext = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <Page themeId="tool">
      <Header
        title="Random Joke"
        subtitle="Need a laugh? Here's a joke for you!"
      />
      <Content>
        {isInitialLoad && <Progress />}
        {error && !currentJoke && <ErrorPanel error={error} />}
        {currentJoke && (
          <InfoCard
            title={`${formatType(currentJoke.type)} Joke`}
            className={classes.card}
          >
            {error && currentJoke && (
              <Box className={classes.refetchError}>
                <ErrorPanel
                  error={error}
                  title="Couldn't fetch a new joke"
                />
              </Box>
            )}
            <Box aria-live="polite" aria-atomic="true">
              <Typography className={classes.setup}>
                {currentJoke.setup}
              </Typography>
              <Collapse
                in={showPunchline}
                timeout={prefersReducedMotion ? 0 : 300}
              >
                <Typography className={classes.punchline}>
                  {currentJoke.punchline}
                </Typography>
              </Collapse>
            </Box>
            <Divider className={classes.divider} />
            <Box className={classes.actions}>
              {!showPunchline ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleReveal}
                >
                  Reveal Punchline
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleNext}
                  disabled={isRefetching}
                >
                  {isRefetching && (
                    <CircularProgress
                      size={18}
                      className={classes.buttonProgress}
                    />
                  )}
                  Get Another Joke
                </Button>
              )}
            </Box>
          </InfoCard>
        )}
      </Content>
    </Page>
  );
};
