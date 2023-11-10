import { findClusterById } from '@/api/cluster';
import { getFileByName } from '@/api/oos';
import CodeBlock from '@/components/CodeBlock';
import { CheckListIcon, DownloadIcon, OfflineIcon, OnlineComputerIcon } from '@/components/Icon';
import { useCopyData } from '@/hooks/useCopyData';
import { ClusterType } from '@/types';
import { downloadFromURL } from '@/utils/downloadFIle';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Center,
  Divider,
  Text
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import ReadMe from './ReadMe';

export default function Tutorial({
  clusterId,
  ossFileUrl
}: {
  clusterId: string;
  ossFileUrl: string;
}) {
  let { fileNameParams, bashParams, ossVersion } = useMemo(() => {
    if (ossFileUrl) {
      let match = /cloud-(.*?)\.tar/g.exec(ossFileUrl);
      console.log(match);
      return {
        fileNameParams: ossFileUrl.replace('/cloud/', ''),
        bashParams: match ? `--cloud-version=${match[1]}` : '--cloud-version v5.0.0-beta1',
        ossVersion: match ? `${match[1]}` : 'v5.0.0-beta1'
      };
    } else {
      return {
        fileNameParams: '',
        bashParams: '',
        ossVersion: ''
      };
    }
  }, [ossFileUrl]);

  const { t } = useTranslation();
  const { copyData } = useCopyData();
  const [ossLink, setOssLink] = useState('');
  const { data } = useQuery(
    ['findClusterByIds', clusterId],
    () =>
      findClusterById({
        clusterId
      }),
    {
      async onSuccess(data) {
        if (data?.orderID && data.type === ClusterType.Enterprise) {
          const _link = await getFileByName(ossFileUrl);
          setOssLink(_link);
        }
      }
    }
  );

  return (
    <Box
      flex={1}
      pt="64px"
      pb="40px"
      px={{
        base: '56px',
        xl: '130px'
      }}
      bg="#F4F6F8"
      overflow="scroll"
    >
      <Text mb="20px" color={'#262A32'} fontSize={'28px'} fontWeight={600} alignSelf={'flex-start'}>
        集群安装教程
      </Text>
      <Accordion color={'#24282C'} allowMultiple>
        <AccordionItem bg="#fff" border={'none'} p="10px 32px" mb="8px" borderRadius={'12px'}>
          <AccordionButton px="0px" _hover={{ bg: '#fff' }}>
            <CheckListIcon w="20px" h="20px" />
            <Text ml="16px" fontSize={'18px'} fontWeight={600}>
              准备工作
            </Text>
            <AccordionIcon ml="auto" w="24px" h="24px" />
          </AccordionButton>
          <AccordionPanel py="20px" pl="40px" gap={'12px'}>
            <ReadMe />
            <Center
              borderRadius={'4px'}
              cursor={'pointer'}
              mt="20px"
              w="218px"
              h="44px"
              color={'#FFF'}
              bg="#24282C"
              fontSize={'14px'}
              fontWeight={600}
              onClick={() =>
                window.open(
                  'https://sealos.io/zh-Hans/docs/self-hosting/installation#%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C'
                )
              }
            >
              详细文档
            </Center>
          </AccordionPanel>
        </AccordionItem>

        {data?.type === ClusterType.Enterprise && (
          <AccordionItem bg="#fff" border={'none'} p="10px 32px" mb="8px" borderRadius={'12px'}>
            <AccordionButton px="0px" _hover={{ bg: '#fff' }}>
              <OfflineIcon w="20px" h="20px" />
              <Text ml="16px" fontSize={'18px'} fontWeight={600}>
                离线安装
              </Text>
              <AccordionIcon ml="auto" w="24px" h="24px" />
            </AccordionButton>
            <AccordionPanel py="20px" pl="40px" gap={'12px'}>
              <Text fontSize={'16px'} fontWeight={600}>
                下载离线包
              </Text>
              <Center
                borderRadius={'4px'}
                cursor={'pointer'}
                mt="12px"
                w="218px"
                h="44px"
                color={'#FFF'}
                bg="#24282C"
                fontSize={'14px'}
                fontWeight={600}
                onClick={() => downloadFromURL(ossLink)}
              >
                <DownloadIcon fill={'#fff'} mr="8px" />
                <Text>点击下载</Text>
              </Center>

              <Text mt="24px" fontSize={'16px'} fontWeight={600} mb="12px">
                服务器上下载
              </Text>
              <CodeBlock
                language="bash"
                code={`wget '${ossLink}' -O ${fileNameParams}`}
              ></CodeBlock>
              <Divider my="20px" />
              <Text mt="12px" fontSize={'16px'} fontWeight={600} mb="12px">
                部署集群
              </Text>
              <CodeBlock
                language="bash"
                code={`tar xzvf ${fileNameParams} \n && cd sealos-cloud && bash install.sh`}
                copyValue={`tar xzvf ${fileNameParams} && cd sealos-cloud && bash install.sh`}
              ></CodeBlock>
            </AccordionPanel>
          </AccordionItem>
        )}

        <AccordionItem bg="#fff" border={'none'} p="10px 32px" mb="8px" borderRadius={'12px'}>
          <AccordionButton px="0px" _hover={{ bg: '#fff' }}>
            <OnlineComputerIcon w="20px" h="20px" />
            <Text ml="16px" fontSize={'18px'} fontWeight={600}>
              在线安装
            </Text>
            <AccordionIcon ml="auto" w="24px" h="24px" />
          </AccordionButton>
          <AccordionPanel py="20px" pl="40px" gap={'12px'}>
            <CodeBlock
              language="bash"
              code={`curl -sfL https://raw.githubusercontent.com/labring/sealos/${ossVersion}/scripts/cloud/install.sh -o /tmp/install.sh && bash /tmp/install.sh ${bashParams}`}
            ></CodeBlock>
            <Center
              borderRadius={'4px'}
              cursor={'pointer'}
              mt="20px"
              w="218px"
              h="44px"
              color={'#FFF'}
              bg="#24282C"
              fontSize={'14px'}
              fontWeight={600}
              onClick={() =>
                window.open(
                  'https://sealos.io/zh-Hans/docs/self-hosting/installation#%E5%AE%89%E8%A3%85%E6%AD%A5%E9%AA%A4'
                )
              }
            >
              详细文档
            </Center>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
}