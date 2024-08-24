
import { useQuery } from "@tanstack/react-query";
import { Container, Spinner, Stack } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { fetchUser, fetchUserAchievementSummary } from "../../../api";
import { AchievementGrid } from "../../../components/AchievementGrid";
import { AchievementRarityChart } from "../../../components/AchievementRarityChart";
import { Avatar, AvatarSize } from "../../../components/Avatar";
import { CountryIcon } from "../../../components/CountryIcon";
import { useTitle } from "../../../hooks";

export default function User() {
  const params = useParams();
  const user = useQuery({
    queryFn: () => fetchUser(params.steam_id),
    queryKey: ["User", params.steam_id],
    staleTime: 1000 * 60 * 5,
  });
  const achievement_summary = useQuery({
    queryFn: () => fetchUserAchievementSummary(params.steam_id),
    queryKey: ["AchievementSummary", params.steam_id],
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      recent: [],
      valuable: [],
      rarity: null,
    }
  });
  useTitle(user.data?.name ?? `User ${params.steam_id}`);

  return (
    <Container>
      <Stack style={{alignItems: "center"}}>
        {user.isPending ? (
          <Spinner/>
        ) : (
          <>
            <h2>{user.data.name}</h2>
            <table>
              <tbody>
                <tr>
                  <td>
                    <table>
                      <tbody>
                        <tr>
                          <td>
                            <table>
                              <tbody>
                                <tr className="bg-dark">
                                  <td width="300px">
                                    <Stack style={{alignItems: "center"}}>
                                      <Avatar avatar={user.data.avatar} size={AvatarSize.Full} width={184} height={184}/>
                                      <Stack direction="horizontal" gap={1} style={{justifyContent: "center"}}>
                                        <img/>
                                        <div>Rank:</div>
                                        <a>0</a>
                                      </Stack>
                                      <a><CountryIcon code={user.data.country_code}/></a>
                                      <progress value="500" max="1000">500</progress>
                                      <a><div style={{fontSize: "x-small"}}></div></a>
                                    </Stack>
                                  </td>
                                  <td style={{paddingLeft: 10 + 'px'}}>
                                    <Stack>
                                      <div>0 games bought on steam</div>
                                      <div>{user.data.app_count} games listed on site</div>
                                      <div className="m-3"/>
                                      <div><a>0</a> games completed 100%.</div>
                                      <div>0 games at 100% that have 100% broken achievements.</div>
                                      <div className="m-3"/>
                                      <div>Site Type AGC%: 0.00 (0 games)</div>
                                      <div>Steam Type AGC%: 0.00</div>
                                      <div className="m-3"/>
                                      <div><Link to={`/users/${params.steam_id}/achievements`}>{user.data.achievement_count}</Link> achievements worth points.</div>
                                      <div><a>0</a> invalid achievements.</div>
                                      <div><a>0</a> achievements marked as not counting.</div>
                                      <div><a>0</a> achievements from removed games.</div>
                                      <div><a>0</a> achievements gained the past 7 days.</div>
                                      <div className="m-3"/>
                                      <div>0 points. (0 bonus.)</div>
                                      <div>0 guides written.</div>
                                      <div>0 guide experience.</div>
                                      <div><Link to={`/users/${params.steam_id}/friends`}>{user.data.friend_count}</Link> friends.</div>
                                      <div><Link to={`/users/${params.steam_id}/groups`}>{user.data.group_count}</Link> groups.</div>
                                      <div className="m-3"/>
                                      <div>0 hours played.</div>
                                      <div>0 hours played last 2 weeks.</div>
                                    </Stack>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <Stack direction="horizontal">
                                      <img/>
                                      <div>Steam Links</div>
                                    </Stack>
                                    <table width="100%">
                                      <tbody>
                                        <tr>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}`}>Profile</a></td>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}/games`}>Games</a></td>
                                        </tr>
                                        <tr>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}/inventory`}>Inventory</a></td>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}/recommended`}>Recommended</a></td>
                                        </tr>
                                        <tr>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}/screenshots`}>Screenshots</a></td>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}/videos`}>Videos</a></td>
                                        </tr>
                                        <tr>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}/badges`}>Badges</a></td>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}/groups`}>Groups</a></td>
                                        </tr>
                                        <tr>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}/friends`}>Friends</a></td>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}/wishlist`}>Wishlist</a></td>
                                        </tr>
                                        <tr>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}/guides`}>Guides</a></td>
                                          <td><a href={`http://steamcommunity.com/profiles/${user.data.steam_id}/tradeoffers`}>Tradeoffers</a></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                  <td>
                                    {achievement_summary.isPlaceholderData ? (
                                      <Spinner/>
                                    ) : (
                                      <AchievementRarityChart rarity={achievement_summary.data.rarity}/>
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                          <td valign="top">
                            <Stack>
                              <a>Most recent achievements</a>
                              {achievement_summary.isPlaceholderData ? (
                                <Spinner/>
                              ) : (
                                <AchievementGrid achievements={achievement_summary.data.recent} width={5}/>
                              )}
                              <a>Most valuable achievements</a>
                              {achievement_summary.isPlaceholderData ? (
                                <Spinner/>
                              ) : (
                                <AchievementGrid achievements={achievement_summary.data.valuable} width={5}/>
                              )}
                            </Stack>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <Link to={`/users/${params.steam_id}/apps`}>View Owned Games</Link>
          </>
        )}
      </Stack>
    </Container>
  );
}
