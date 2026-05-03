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
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Fade from '@material-ui/core/Fade';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 600,
    margin: `${theme.spacing(2)}px auto`,
  },
  setup: {
    fontSize: '1.4rem',
    marginBottom: theme.spacing(3),
  },
  punchline: {
    fontSize: '1.2rem',
    fontStyle: 'italic',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(3),
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

interface Joke {
  type: string;
  setup: string;
  punchline: string;
  id: number;
}

export const JokePage = () => {
  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);

  const {
    value: joke,
    loading,
    error,
  } = useAsync(async () => {
    const proxyUrl = await discoveryApi.getBaseUrl('proxy');
    const response = await fetchApi.fetch(
      `${proxyUrl}/joke-api/random_joke`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch joke: ${response.statusText}`);
    }
    setShowPunchline(false);
    return response.json() as Promise<Joke>;
  }, [refreshKey]);

  const handleReveal = useCallback(() => setShowPunchline(true), []);
  const handleNext = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <Page themeId="tool">
      <Header
        title="Random Joke"
        subtitle="Need a laugh? Here's a joke for you!"
      />
      <Content>
        {loading && <Progress />}
        {error && <ErrorPanel error={error} />}
        {joke && !loading && (
          <InfoCard title="Here's a joke..." className={classes.card}>
            <Typography className={classes.setup}>{joke.setup}</Typography>
            {!showPunchline ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleReveal}
              >
                Reveal Punchline
              </Button>
            ) : (
              <Fade in>
                <Box>
                  <Typography className={classes.punchline}>
                    {joke.punchline}
                  </Typography>
                </Box>
              </Fade>
            )}
            <Box className={classes.actions}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleNext}
              >
                Get Another Joke
              </Button>
            </Box>
          </InfoCard>
        )}
      </Content>
    </Page>
  );
};
