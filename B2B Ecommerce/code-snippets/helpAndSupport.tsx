import { useEffect, useState } from 'react';
import ContentWrapper from "../../Layout/ContentWrapper";
import "../admin.css";
import { t } from 'i18next';
import view from '@/assets/view.png';
import chat from  "@/assets/message.png";
import { useAllTickets } from '@/features/manufacture/api/help-support/getAllTickets';
import GearSpinner from '@/vibe/components/Spinner/GearSpinner';
import { Table } from '@/vibe/components/SimpleTable/Table';
import { usePagination } from '@/hooks/usePaginaton';
import { upperFirst } from '@/lib/lodash';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

export const HelpAndSupport = () => {
  const navigate = useNavigate();
  const { page, changePage } = usePagination();
  const [search, setSearch] = useState<string>('');
  const { data, isLoading, isFetching, refetch } = useAllTickets({ search, page });

  useEffect(() => {
    changePage(1);
    const fetchQueryTickets = setTimeout(() => {
      refetch();
    }, 500);
    return () => clearTimeout(fetchQueryTickets);
  }, [search])

  useEffect(()=> {
    refetch();
  },[page])


  const color: {
    [key: string]: string
  } = {
    'CLOSED': '#D70013',
    'RAISED': '#63d37d'
  }

  return (
    <ContentWrapper title={t('help_support')}>
      <div className="content-wrapper">
        <div className="top-titlebar pb-3 d-flex flex-row align-items-center">
          <div className="heading">
            <h2 className="f-20 bold title-main">{t('tickets')}</h2>
          </div>
        </div>
        <div className="data-filters white-card d-block">
          <div className="search-input new-offer d-block">
            <div className="row">
              <div className="col-12 col-md-5">
                <input
                  type="text"
                  placeholder={t("Search")}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        {isLoading || isFetching ? <GearSpinner /> :
          <div className="manage-user-data survey table-customer taxes border-0 mt-4">
            <div className="card px-0 border-0">
              <div className="manage-user-table">
                <Table
                  currentPage={page}
                  hideRowsPerPage={true}
                  onPageChange={changePage}
                  data={data?.data ?? []}
                  totalCount={data?.meta?.last_page}
                  columns={[
                    {
                      title: `${t("company_name")}`,
                      field: "user",
                      Cell({ entry: { user } }) {
                        const companyName = user?.roleNames !== 'carrier' ? user?.company?.company_name : user?.shipping_company?.company_name
                        return (
                          <div className="user-table-icon">
                            <div className="table-user-deta">
                              <span className="f-14 bold">
                                {upperFirst(companyName)}
                              </span>
                              <span className="f-12 bold">{upperFirst(user?.roleNames)}</span>
                            </div>
                          </div>

                        );
                      },
                    },
                    {
                      title: `${t("title")}`,
                      field: "title",
                      Cell({ entry: { title } }) {
                        return (
                          <div className="user-table-icon">
                            <span className="f-12">{title?.length > 20 ? `${title?.slice(0, 20)}.......` : title}</span>
                          </div>
                        );
                      },
                    },
                    {
                      title: `${t("query")}`,
                      field: "query",
                      Cell({ entry: { query } }) {
                        return (
                          <div className="user-table-icon">
                            <span className="f-12">{query?.length > 40 ? `${query?.slice(0, 40)}.......` : query}</span>
                          </div>
                        );
                      },
                    },
                    {
                      title: `${t("ticket_status")}`,
                      field: "status",
                      Cell({ entry: { status } }) {
                        return (
                          <div className="user-table-icon">
                            <span className="f-12 bold" style={{color: color[status]}}>{upperFirst(status)}</span>
                          </div>
                        );
                      },
                    },
                    {
                      title: `Date`,
                      field: "created_at",
                      Cell({ entry: { created_at } }) {
                        return (
                          <div className="user-table-icon">
                            <span className="f-12">{moment(created_at).format('DD MMM YYYY')}</span>
                          </div>
                        );
                      },
                    },
                    {
                      title: `${t('Action')}`,
                      field: "id",
                      Cell({ entry: { id } }) {
                        return (
                          <div className="d-flex categories-action" style={{ gap: "10px" }}>
                            <img src={view} title='View Query' className="f-12" onClick={() => navigate(`/admin/view-query/${id}`)} />
                            <img src={chat} title='View Ticket Conversation' className="f-12" onClick={() => navigate(`/admin/ticket-conversation/${id}`)} />
                          </div>
                        );
                      },
                    }
                  ]}
                />
              </div>
            </div>
          </div>
        }
      </div>
    </ContentWrapper>
  );
};
